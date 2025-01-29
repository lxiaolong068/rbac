import { Request, Response, NextFunction } from 'express';
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

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// 验证 JWT token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, '未提供认证令牌');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(401, '未提供认证令牌');
    }

    // 验证 token
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;

    // 将用户信息添加到请求对象
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, '无效的认证令牌'));
    } else {
      next(err);
    }
  }
};

// 权限验证中间件
export const auth = (requiredPermissions: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 先验证 token
      verifyToken(req, res, () => {
        // 如果没有指定所需权限，直接通过
        if (requiredPermissions.length === 0) {
          return next();
        }

        // 验证用户是否有所需权限
        const userPermissions = req.user?.permissions || [];
        const hasPermission = requiredPermissions.every(permission =>
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          throw new AppError(403, '权限不足');
        }

        next();
      });
    } catch (err) {
      next(err);
    }
  };
}; 