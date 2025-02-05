import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../middlewares/auth.middleware';

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

interface CreateRoleBody {
  name: string;
  description?: string;
  permissionIds?: string[];
}

interface UpdateRoleBody {
  name?: string;
  description?: string;
}

interface UpdateRolePermissionsBody {
  permissionIds: string[];
}

const roleRouter: FastifyPluginAsync = async (fastify) => {
  // 添加认证中间件
  fastify.addHook('preHandler', authenticate);

  // 获取角色列表
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const roles = await prisma.role.findMany({
      include: {
        rolePerms: {
          include: {
            permission: true
          }
        }
      }
    });
    return {
      status: 'success',
      data: {
        roles: roles.map(role => ({
          ...role,
          permissions: role.rolePerms.map(rp => rp.permission),
        })),
      },
    };
  });

  // 获取单个角色
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const role = await prisma.role.findUnique({
      where: { id: request.params.id },
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
      throw new Error('角色不存在');
    }

    return {
      status: 'success',
      data: {
        role: {
          ...role,
          permissions: role.rolePerms.map(rp => rp.permission),
          users: role.userRoles.map(ur => ur.user),
        },
      },
    };
  });

  // 创建角色
  fastify.post<{ Body: CreateRoleBody }>('/', async (request, reply) => {
    const { name, description, permissionIds } = createRoleSchema.parse(request.body);

    // 检查角色名是否已存在
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new Error('角色名已存在');
    }

    // 如果提供了权限ID，检查权限是否都存在
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        throw new Error('部分权限不存在');
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

    reply.code(201);
    return {
      status: 'success',
      data: {
        role: {
          ...role,
          permissions: role.rolePerms.map(rp => rp.permission),
        },
      },
    };
  });

  // 更新角色
  fastify.put<{ Params: { id: string }, Body: UpdateRoleBody }>('/:id', async (request, reply) => {
    const { name, description } = updateRoleSchema.parse(request.body);

    // 检查角色是否存在
    const role = await prisma.role.findUnique({
      where: { id: request.params.id },
    });

    if (!role) {
      throw new Error('角色不存在');
    }

    // 如果要更新角色名，检查新名称是否已存在
    if (name && name !== role.name) {
      const existingRole = await prisma.role.findUnique({
        where: { name },
      });

      if (existingRole) {
        throw new Error('角色名已存在');
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

    return {
      status: 'success',
      data: {
        role: {
          ...updatedRole,
          permissions: updatedRole.rolePerms.map(rp => rp.permission),
        },
      },
    };
  });

  // 更新角色权限
  fastify.put<{ Params: { id: string }, Body: UpdateRolePermissionsBody }>('/:id/permissions', async (request, reply) => {
    const { permissionIds } = request.body;

    // 检查角色是否存在
    const role = await prisma.role.findUnique({
      where: { id: request.params.id },
    });

    if (!role) {
      throw new Error('角色不存在');
    }

    // 检查权限是否都存在
    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new Error('部分权限不存在');
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

    if (!updatedRole) {
      throw new Error('角色更新失败');
    }

    return {
      status: 'success',
      data: {
        role: {
          ...updatedRole,
          permissions: updatedRole.rolePerms.map(rp => rp.permission),
        },
      },
    };
  });

  // 删除角色
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;

    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new Error('角色不存在');
    }

    await prisma.role.delete({
      where: { id },
    });

    return {
      status: 'success',
      message: '角色删除成功',
    };
  });
};

export default roleRouter;