import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // 公开路由
  // 登录路由
  fastify.post('/auth/login', AuthController.login);
  
  // 注册路由
  fastify.post('/auth/register', AuthController.register);
  
  // 重置密码路由
  fastify.post('/auth/reset-password', AuthController.resetPassword);

  // 需要认证的路由
  // 修改密码路由
  fastify.post('/auth/change-password', {
    preHandler: authenticate,
    handler: AuthController.changePassword
  });
};

export default fp(authRoutes);