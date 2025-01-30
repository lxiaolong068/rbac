import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from './errorHandler';

// 定义 Token 载荷接口
interface TokenPayload {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
}

// 扩展 Fastify Request 类型
declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

// 验证 JWT token
const verifyToken = async (request: FastifyRequest) => {
  // 从请求头获取 token
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, '未提供认证令牌');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError(401, '未提供认证令牌');
  }

  try {
    // 验证 token
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    // 将用户信息添加到请求对象
    request.user = decoded;
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, '无效的认证令牌');
    }
    throw err;
  }
};

// 权限验证中间件
export const auth = (requiredPermissions: string[] = []) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await verifyToken(request);

    // 如果没有指定所需权限，直接通过
    if (requiredPermissions.length === 0) {
      return;
    }

    // 验证用户是否有所需权限
    const userPermissions = request.user?.permissions || [];
    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw new AppError(403, '权限不足');
    }
  };
}; 