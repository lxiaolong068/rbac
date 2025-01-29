import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { auth } from '../middleware/auth';

const router = Router();

// 获取用户列表
router.get('/', auth(['users:read']), async (req, res, next) => {
  try {
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

    res.json({
      status: 'success',
      data: {
        users: users.map(user => ({
          ...user,
          roles: user.userRoles.map(ur => ur.role),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// 获取单个用户
router.get('/:id', auth(['users:read']), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
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

    res.json({
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
    });
  } catch (err) {
    next(err);
  }
});

// 更新用户角色
const updateUserRolesSchema = z.object({
  roleIds: z.array(z.string()),
});

router.put('/:id/roles', auth(['users:update']), async (req, res, next) => {
  try {
    const { roleIds } = updateUserRolesSchema.parse(req.body);

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
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

    res.json({
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
    });
  } catch (err) {
    next(err);
  }
});

// 删除用户
router.delete('/:id', auth(['users:delete']), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export const userRouter = router; 