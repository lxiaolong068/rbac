import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.config.js';

const prisma = new PrismaClient();

interface JwtPayload {
  id: number;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export class UserService {
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns 登录结果
   */
  async login(username: string, password: string) {
    // 1. 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        roles: {
          include: {
            permissions: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 2. 检查用户是否被锁定
    if (user.isLocked) {
      throw new Error('账户已被锁定');
    }

    // 3. 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // 4. 生成 Token
    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map(role => role.code),
      permissions: user.roles.flatMap(role => 
        role.permissions.map(permission => permission.code)
      )
    };

    const token = jwt.sign(
      payload,
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    );

    // 5. 更新最后登录时间和IP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        // loginIP 将在控制器中设置
      }
    });

    // 6. 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actionType: 'USER_LOGIN',
        targetType: 'USER',
        targetId: user.id,
        beforeState: Prisma.JsonNull,
        afterState: {
          lastLogin: new Date().toISOString(),
        }
      }
    });

    // 7. 返回用户信息和token
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles.map(role => ({
          code: role.code,
          name: role.name
        })),
        permissions: user.roles.flatMap(role => 
          role.permissions.map(permission => ({
            code: permission.code,
            name: permission.name
          }))
        )
      }
    };
  }

  /**
   * 更新用户登录IP
   * @param userId 用户ID
   * @param ip 登录IP
   */
  async updateLoginIP(userId: number, ip: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { loginIP: ip }
    });

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId,
        actionType: 'LOGIN_IP_UPDATE',
        targetType: 'USER',
        targetId: userId,
        beforeState: Prisma.JsonNull,
        afterState: {
          loginIP: ip,
          timestamp: new Date().toISOString()
        }
      }
    });
  }

  /**
   * 修改密码
   * @param userId 用户ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    // 1. 查找用户
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 2. 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('原密码错误');
    }

    // 3. 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, authConfig.bcryptSaltRounds);

    // 4. 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // 5. 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId,
        actionType: 'PASSWORD_CHANGE',
        targetType: 'USER',
        targetId: userId,
        beforeState: Prisma.JsonNull,
        afterState: {
          passwordChanged: new Date().toISOString()
        }
      }
    });
  }

  /**
   * 重置密码
   * @param userId 用户ID
   * @param newPassword 新密码
   * @param operatorId 操作者ID
   */
  async resetPassword(userId: number, newPassword: string, operatorId: number) {
    // 1. 查找用户
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 2. 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, authConfig.bcryptSaltRounds);

    // 3. 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // 4. 记录审计日志
    await prisma.auditLog.create({
      data: {
        userId: operatorId,
        actionType: 'PASSWORD_RESET',
        targetType: 'USER',
        targetId: userId,
        beforeState: Prisma.JsonNull,
        afterState: {
          passwordReset: new Date().toISOString()
        }
      }
    });
  }
} 