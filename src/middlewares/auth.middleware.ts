import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.config.js';

// 扩展 Express 的 Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        roles: string[];
        permissions: string[];
      };
    }
  }
}

/**
 * 验证 JWT Token
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({
      message: '未提供访问令牌'
    });
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret) as jwt.JwtPayload;
    req.user = {
      id: decoded.id as number,
      username: decoded.username as string,
      email: decoded.email as string,
      roles: decoded.roles as string[],
      permissions: decoded.permissions as string[]
    };
    next();
  } catch (error) {
    return res.status(401).json({
      message: '无效的访问令牌'
    });
  }
};

/**
 * 检查是否具有指定角色
 * @param roles 角色列表
 */
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(403).json({
        message: '需要登录后访问'
      });
    }

    const hasRequiredRole = req.user.roles.some(role => roles.includes(role));
    if (!hasRequiredRole) {
      return res.status(403).json({
        message: '没有访问权限'
      });
    }

    next();
  };
};

/**
 * 检查是否具有指定权限
 * @param permissions 权限列表
 */
export const hasPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(403).json({
        message: '需要登录后访问'
      });
    }

    const hasRequiredPermission = req.user.permissions.some(
      permission => permissions.includes(permission)
    );
    
    if (!hasRequiredPermission) {
      return res.status(403).json({
        message: '没有访问权限'
      });
    }

    next();
  };
}; 