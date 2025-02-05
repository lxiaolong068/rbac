import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../middlewares/auth.middleware';

// 权限验证schema
const permissionSchema = z.object({
  name: z.string().min(1, '权限名称不能为空'),
  description: z.string().optional(),
  resource: z.string().min(1, '资源名称不能为空'),
  action: z.string().min(1, '操作类型不能为空')
});

interface PermissionBody {
  name: string;
  description?: string;
  resource: string;
  action: string;
}

const permissionRouter: FastifyPluginAsync = async (fastify) => {
  // 添加认证中间件
  fastify.addHook('preHandler', authenticate);

  // 获取所有权限
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const permissions = await prisma.permission.findMany();
    return permissions;
  });

  // 获取单个权限
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const permission = await prisma.permission.findUnique({
      where: { id }
    });
    
    if (!permission) {
      reply.code(404);
      return { message: 'Permission not found' };
    }
    
    return permission;
  });

  // 创建新权限
  fastify.post<{ Body: PermissionBody }>('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = permissionSchema.parse(request.body);

    const existingPermission = await prisma.permission.findFirst({
      where: {
        OR: [
          { name: data.name },
          {
            AND: [
              { resource: data.resource },
              { action: data.action }
            ]
          }
        ]
      }
    });

    if (existingPermission) {
      return reply.status(400).send({ message: '权限名称或资源操作组合已存在' });
    }

    const permission = await prisma.permission.create({
      data
    });
    reply.code(201);
    return permission;
  });

  // 更新权限
  fastify.put<{ Params: { id: string }, Body: PermissionBody }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const data = permissionSchema.parse(request.body);
    
    const permission = await prisma.permission.findUnique({
      where: { id }
    });
    
    if (!permission) {
      reply.code(404);
      return { message: 'Permission not found' };
    }
    
    const existingPermission = await prisma.permission.findFirst({
      where: {
        OR: [
          {
            name: data.name,
            NOT: { id }
          },
          {
            AND: [
              { resource: data.resource },
              { action: data.action },
              { NOT: { id } }
            ]
          }
        ]
      }
    });

    if (existingPermission) {
      return reply.status(400).send({ message: '权限名称或资源操作组合已存在' });
    }

    const updatedPermission = await prisma.permission.update({
      where: { id },
      data
    });
    
    return updatedPermission;
  });

  // 删除权限
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    await prisma.permission.delete({
      where: { id }
    });
    reply.code(204);
    return;
  });
};

export default permissionRouter;
