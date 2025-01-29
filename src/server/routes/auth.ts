import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

const router = Router();

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

// 登录路由
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

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
    res.json({
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: roles[0] || 'user',
        },
        token,
      }
    });
  } catch (err) {
    next(err);
  }
});

// 注册路由
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

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

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
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
    });
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };