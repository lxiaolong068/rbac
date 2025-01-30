import { FastifyPluginAsync, FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

// 登录请求验证schema
const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
  remember: z.boolean().optional(),
});

// 注册请求验证schema
const registerSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

interface LoginBody {
  username: string;
  password: string;
  remember?: boolean;
}

interface RegisterBody {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const authRouter: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // 登录路由
  fastify.post<{ Body: LoginBody }>('/login', async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    const data = loginSchema.parse(request.body);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username: data.username },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePerms: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new AppError(401, '用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, '用户名或密码错误');
    }

    // 生成权限列表
    const permissions = user.userRoles.flatMap(userRole => 
      userRole.role.rolePerms.map(rolePerm => 
        `${rolePerm.permission.resource}:${rolePerm.permission.action}`
      )
    );

    // 生成角色列表
    const roles = user.userRoles.map(userRole => userRole.role.name);

    // 生成 token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        roles,
        permissions,
      },
      config.jwt.secret,
      {
        expiresIn: data.remember ? '30d' : config.jwt.expiresIn,
      } as jwt.SignOptions
    );

    // 返回用户信息和token
    return {
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: roles[0] || 'user',
        },
        token,
      }
    };
  });

  // 注册路由
  fastify.post<{ Body: RegisterBody }>('/register', async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    const data = registerSchema.parse(request.body);

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email }
        ]
      }
    });

    if (existingUser) {
      throw new AppError(400, '用户名或邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, config.bcrypt.saltRounds);

    // 创建用户并分配基本角色
    const user = await prisma.$transaction(async (tx) => {
      // 创建用户
      const newUser = await tx.user.create({
        data: {
          username: data.username,
          email: data.email,
          password: hashedPassword,
        },
      });

      // 查找或创建基本角色
      let basicRole = await tx.role.findFirst({
        where: { name: 'user' },
      });

      if (!basicRole) {
        basicRole = await tx.role.create({
          data: {
            name: 'user',
            description: '基本用户角色',
          },
        });

        // 创建基本权限
        const basicPermissions = [
          { resource: 'users', action: 'read' },
          { resource: 'roles', action: 'read' },
          { resource: 'permissions', action: 'read' },
        ];

        // 创建权限并关联到角色
        for (const perm of basicPermissions) {
          const permission = await tx.permission.create({
            data: {
              name: `${perm.resource}:${perm.action}`,
              description: `允许${perm.action} ${perm.resource}`,
              resource: perm.resource,
              action: perm.action,
            },
          });

          await tx.rolePermission.create({
            data: {
              roleId: basicRole.id,
              permissionId: permission.id,
            },
          });
        }
      }

      // 分配角色给用户
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: basicRole.id,
        },
      });

      return newUser;
    });

    reply.code(201);
    return {
      status: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    };
  });
};

export { authRouter };