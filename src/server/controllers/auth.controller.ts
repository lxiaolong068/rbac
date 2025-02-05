import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { LoginRequest, RegisterRequest, ChangePasswordRequest } from '../../shared/types/auth.js';

export class AuthController {
  static async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) {
    try {
      const result = await AuthService.login(request.body);
      return reply.send(result);
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(401).send({ message: error.message });
      }
      return reply.status(500).send({ message: '登录失败' });
    }
  }

  static async register(request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) {
    try {
      const result = await AuthService.register(request.body);
      return reply.status(201).send(result);
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      return reply.status(500).send({ message: '注册失败' });
    }
  }

  static async changePassword(request: FastifyRequest<{ Body: ChangePasswordRequest }>, reply: FastifyReply) {
    try {
      if (!(request as any).user?.userId) {
        return reply.status(401).send({ message: '需要认证' });
      }

      const result = await AuthService.changePassword((request as any).user.userId, request.body);
      return reply.send(result);
    } catch (error) {
      if (error instanceof Error) {
        return reply.status(400).send({ message: error.message });
      }
      return reply.status(500).send({ message: '修改密码失败' });
    }
  }

  static async resetPassword(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) {
    try {
      const result = await AuthService.resetPassword(request.body.email);
      return reply.send(result);
    } catch (error) {
      // 为了安全，不返回具体错误信息
      return reply.send({ message: '如果该邮箱存在，重置密码链接将发送到您的邮箱' });
    }
  }
}