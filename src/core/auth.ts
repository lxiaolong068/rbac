import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { logger } from './logger';
import { DatabaseManager } from './database';

export class AuthManager {
  // 用户认证
  static async authenticate(username: string, password: string) {
    try {
      // 查找用户
      const user = await DatabaseManager.client.user.findUnique({
        where: { username },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
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

      if (!user) {
        throw new Error('用户不存在');
      }

      // 验证密码
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('密码错误');
      }

      // 生成 Token
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        user: this.sanitizeUser(user),
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('认证失败:', error);
      throw error;
    }
  }

  // 生成访问令牌
  private static generateToken(user: any) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      config.auth.jwt.secret,
      { expiresIn: config.auth.jwt.expiresIn }
    );
  }

  // 生成刷新令牌
  private static generateRefreshToken(user: any) {
    return jwt.sign(
      { id: user.id },
      config.auth.jwt.secret,
      { expiresIn: config.auth.jwt.refreshExpiresIn }
    );
  }

  // 验证令牌中间件
  static verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new Error('未提供认证令牌');
      }

      const decoded = jwt.verify(token, config.auth.jwt.secret);
      req.user = decoded;
      next();
    } catch (error) {
      logger.error('令牌验证失败:', error);
      res.status(401).json({ error: '认证失败' });
    }
  }

  // 权限检查中间件
  static checkPermissions(requiredPermissions: string[], options = { requireAll: true }) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user?.id) {
          throw new Error('未认证的请求');
        }

        // 获取用户权限
        const user = await DatabaseManager.client.user.findUnique({
          where: { id: req.user.id },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
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

        if (!user) {
          throw new Error('用户不存在');
        }

        // 提取用户权限
        const userPermissions = user.userRoles.flatMap(ur => 
          ur.role.rolePermissions.map(rp => rp.permission.name)
        );

        // 检查权限
        const hasPermission = options.requireAll
          ? requiredPermissions.every(p => userPermissions.includes(p))
          : requiredPermissions.some(p => userPermissions.includes(p));

        if (!hasPermission) {
          throw new Error('权限不足');
        }

        next();
      } catch (error) {
        logger.error('权限检查失败:', error);
        res.status(403).json({ error: '权限不足' });
      }
    };
  }

  // 清理用户数据（移除敏感信息）
  private static sanitizeUser(user: any) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // 刷新令牌
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.auth.jwt.secret) as { id: string };
      
      const user = await DatabaseManager.client.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('刷新令牌失败:', error);
      throw error;
    }
  }

  // 修改密码
  static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      const user = await DatabaseManager.client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      // 验证旧密码
      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        throw new Error('旧密码错误');
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, config.auth.bcrypt.saltRounds);

      // 更新密码
      await DatabaseManager.client.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      return true;
    } catch (error) {
      logger.error('修改密码失败:', error);
      throw error;
    }
  }
} 