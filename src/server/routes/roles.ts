import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { auth } from '../middleware/auth';

const router = Router();

// 创建角色请求验证schema
const createRoleSchema = z.object({
  name: z.string().min(1, '角色名称不能为空'),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

// 更新角色请求验证schema
const updateRoleSchema = z.object({
  name: z.string().min(1, '角色名称不能为空').optional(),
  description: z.string().optional(),
});

// 获取角色列表
router.get('/', auth(['roles:read']), async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        rolePerms: {
          include: {
            permission: true,
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: {
        roles: roles.map(role => ({
          ...role,
          permissions: role.rolePerms.map(rp => rp.permission),
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// 获取单个角色
router.get('/:id', auth(['roles:read']), async (req, res, next) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: req.params.id },
      include: {
        rolePerms: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new AppError(404, '角色不存在');
    }

    res.json({
      status: 'success',
      data: {
        role: {
          ...role,
          permissions: role.rolePerms.map(rp => rp.permission),
          users: role.userRoles.map(ur => ur.user),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// 创建角色
router.post('/', auth(['roles:create']), async (req, res, next) => {
  try {
    const { name, description, permissionIds } = createRoleSchema.parse(req.body);

    // 检查角色名是否已存在
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new AppError(409, '角色名已存在');
    }

    // 如果提供了权限ID，检查权限是否都存在
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        throw new AppError(400, '部分权限不存在');
      }
    }

    // 创建角色
    const role = await prisma.role.create({
      data: {
        name,
        description,
        ...(permissionIds && {
          rolePerms: {
            create: permissionIds.map(permissionId => ({
              permission: {
                connect: { id: permissionId },
              },
            })),
          },
        }),
      },
      include: {
        rolePerms: {
          include: {
            permission: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        role: {
          ...role,
          permissions: role.rolePerms.map(rp => rp.permission),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// 更新角色
router.patch('/:id', auth(['roles:update']), async (req, res, next) => {
  try {
    const { name, description } = updateRoleSchema.parse(req.body);

    // 检查角色是否存在
    const role = await prisma.role.findUnique({
      where: { id: req.params.id },
    });

    if (!role) {
      throw new AppError(404, '角色不存在');
    }

    // 如果要更新角色名，检查新名称是否已存在
    if (name && name !== role.name) {
      const existingRole = await prisma.role.findUnique({
        where: { name },
      });

      if (existingRole) {
        throw new AppError(409, '角色名已存在');
      }
    }

    // 更新角色
    const updatedRole = await prisma.role.update({
      where: { id: role.id },
      data: {
        name,
        description,
      },
      include: {
        rolePerms: {
          include: {
            permission: true,
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: {
        role: {
          ...updatedRole,
          permissions: updatedRole.rolePerms.map(rp => rp.permission),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// 更新角色权限
router.put('/:id/permissions', auth(['roles:update']), async (req, res, next) => {
  try {
    const { permissionIds } = z.object({
      permissionIds: z.array(z.string()),
    }).parse(req.body);

    // 检查角色是否存在
    const role = await prisma.role.findUnique({
      where: { id: req.params.id },
    });

    if (!role) {
      throw new AppError(404, '角色不存在');
    }

    // 检查权限是否都存在
    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new AppError(400, '部分权限不存在');
    }

    // 更新角色权限
    await prisma.$transaction([
      // 删除旧的权限关联
      prisma.rolePermission.deleteMany({
        where: { roleId: role.id },
      }),
      // 创建新的权限关联
      prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId: role.id,
          permissionId,
        })),
      }),
    ]);

    // 获取更新后的角色信息
    const updatedRole = await prisma.role.findUnique({
      where: { id: role.id },
      include: {
        rolePerms: {
          include: {
            permission: true,
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: {
        role: {
          ...updatedRole,
          permissions: updatedRole?.rolePerms.map(rp => rp.permission),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// 删除角色
router.delete('/:id', auth(['roles:delete']), async (req, res, next) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: req.params.id },
    });

    if (!role) {
      throw new AppError(404, '角色不存在');
    }

    await prisma.role.delete({
      where: { id: role.id },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export const roleRouter = router; 