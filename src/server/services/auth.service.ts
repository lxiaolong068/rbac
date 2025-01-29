import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import type { LoginRequest, RegisterRequest, ChangePasswordRequest } from '../../shared/types/auth.js';

export class AuthService {
  private static generateToken(userId: string, username: string, roles: string[], permissions: string[]) {
    return jwt.sign(
      { userId, username, roles, permissions },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  static async login({ username, password }: LoginRequest) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      },
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

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new Error('用户已被禁用');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('用户名或密码错误');
    }

    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = user.userRoles.flatMap(ur => 
      ur.role.rolePerms.map(rp => `${rp.permission.resource}:${rp.permission.action}`)
    );

    const token = this.generateToken(user.id, user.username, roles, permissions);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles,
        permissions
      }
    };
  }

  static async register({ username, email, password }: RegisterRequest) {
    // 检查用户名和邮箱是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      throw new Error('用户名或邮箱已存在');
    }

    // 密码强度验证
    if (password.length < Number(process.env.PASSWORD_MIN_LENGTH || 10)) {
      throw new Error('密码长度不足');
    }

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        isActive: true
      }
    });

    // 分配默认角色（普通用户）
    const userRole = await prisma.role.findFirst({
      where: { name: 'User' }
    });

    if (userRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: userRole.id
        }
      });
    }

    return { message: '注册成功' };
  }

  static async changePassword(userId: string, { oldPassword, newPassword }: ChangePasswordRequest) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new Error('原密码错误');
    }

    // 密码强度验证
    if (newPassword.length < Number(process.env.PASSWORD_MIN_LENGTH || 10)) {
      throw new Error('新密码长度不足');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: '密码修改成功' };
  }

  static async resetPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // 为了安全，即使用户不存在也返回成功
      return { message: '如果该邮箱存在，重置密码链接将发送到您的邮箱' };
    }

    // TODO: 实现发送重置密码邮件的逻辑
    // 1. 生成重置令牌
    // 2. 保存令牌到数据库
    // 3. 发送重置邮件

    return { message: '如果该邮箱存在，重置密码链接将发送到您的邮箱' };
  }
} 