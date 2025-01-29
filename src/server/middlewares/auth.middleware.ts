import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../../shared/types/auth.js';
import { prisma } from '../../config/database.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // 验证用户是否存在且处于激活状态
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePerms: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: '用户不存在或已被禁用' });
    }

    // 更新令牌中的权限信息
    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = user.userRoles.flatMap(ur => 
      ur.role.rolePerms.map(rp => `${rp.permission.resource}:${rp.permission.action}`)
    );

    req.user = {
      userId: user.id,
      username: user.username,
      roles,
      permissions
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: '认证令牌已过期' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: '无效的认证令牌' });
    }
    next(error);
  }
};

export const authorize = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: '需要认证' });
    }

    const hasPermission = requiredPermissions.every(permission =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: '权限不足' });
    }

    next();
  };
}; 