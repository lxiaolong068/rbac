import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { auth } from '../middleware/auth';

interface UpdateUserRolesBody {
  roleIds: string[];
}

const userRouter: FastifyPluginAsync = async (fastify) => {
  // 获取用户列表
  fastify.get('/', {
    preHandler: auth(['users:read']),
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      });

      return {
        status: 'success',
        data: {
          users: users.map(user => ({
            ...user,
            roles: user.userRoles.map(ur => ur.role),
          })),
        },
      };
    }
  });

  // 获取单个用户
  fastify.get('/:id', {
    preHandler: auth(['users:read']),
    handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.params.id },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  rolePerms: {
                    select: {
                      permission: {
                        select: {
                          id: true,
                          name: true,
                          resource: true,
                          action: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw new AppError(404, '用户不存在');
      }

      return {
        status: 'success',
        data: {
          user: {
            ...user,
            roles: user.userRoles.map(ur => ({
              ...ur.role,
              permissions: ur.role.rolePerms.map(rp => rp.permission),
            })),
          },
        },
      };
    }
  });

  // 更新用户角色
  const updateUserRolesSchema = z.object({
    roleIds: z.array(z.string()),
  });

  fastify.put<{ Params: { id: string }, Body: UpdateUserRolesBody }>('/:id/roles', {
    preHandler: auth(['users:update']),
    handler: async (request, reply) => {
      const { roleIds } = updateUserRolesSchema.parse(request.body);

      // 检查用户是否存在
      const user = await prisma.user.findUnique({
        where: { id: request.params.id },
      });

      if (!user) {
        throw new AppError(404, '用户不存在');
      }

      // 检查角色是否都存在
      const roles = await prisma.role.findMany({
        where: { id: { in: roleIds } },
      });

      if (roles.length !== roleIds.length) {
        throw new AppError(400, '部分角色不存在');
      }

      // 更新用户角色
      await prisma.$transaction([
        // 删除旧的角色关联
        prisma.userRole.deleteMany({
          where: { userId: user.id },
        }),
        // 创建新的角色关联
        prisma.userRole.createMany({
          data: roleIds.map(roleId => ({
            userId: user.id,
            roleId,
          })),
        }),
      ]);

      // 获取更新后的用户信息
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePerms: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return {
        status: 'success',
        data: {
          user: {
            ...updatedUser,
            roles: updatedUser?.userRoles.map(ur => ({
              ...ur.role,
              permissions: ur.role.rolePerms.map(rp => rp.permission),
            })),
          },
        },
      };
    }
  });

  // 删除用户
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: auth(['users:delete']),
    handler: async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.params.id },
      });

      if (!user) {
        throw new AppError(404, '用户不存在');
      }

      await prisma.user.delete({
        where: { id: user.id },
      });

      reply.code(204);
      return;
    }
  });
};

export { userRouter }; 