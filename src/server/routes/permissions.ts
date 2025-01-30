import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';
import { z } from 'zod';

const prisma = new PrismaClient();

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
  // 获取所有权限
  fastify.get('/', {
    preHandler: auth(['permissions:read']),
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const permissions = await prisma.permission.findMany();
      return permissions;
    }
  });

  // 获取单个权限
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: auth(['permissions:read']),
    handler: async (request, reply) => {
      const { id } = request.params;
      const permission = await prisma.permission.findUnique({
        where: { id }
      });
      
      if (!permission) {
        reply.code(404);
        return { message: 'Permission not found' };
      }
      
      return permission;
    }
  });

  // 创建新权限
  fastify.post<{ Body: PermissionBody }>('/', {
    preHandler: auth(['permissions:create']),
    handler: async (request, reply) => {
      const data = permissionSchema.parse(request.body);
      const permission = await prisma.permission.create({
        data
      });
      reply.code(201);
      return permission;
    }
  });

  // 更新权限
  fastify.put<{ Params: { id: string }, Body: PermissionBody }>('/:id', {
    preHandler: auth(['permissions:update']),
    handler: async (request, reply) => {
      const { id } = request.params;
      const data = permissionSchema.parse(request.body);
      
      const permission = await prisma.permission.update({
        where: { id },
        data
      });
      
      return permission;
    }
  });

  // 删除权限
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: auth(['permissions:delete']),
    handler: async (request, reply) => {
      const { id } = request.params;
      await prisma.permission.delete({
        where: { id }
      });
      reply.code(204);
      return;
    }
  });
};

export { permissionRouter };
