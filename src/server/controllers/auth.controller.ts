import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { LoginRequest, RegisterRequest, ChangePasswordRequest } from '../../shared/types/auth.js';

export class AuthController {
  static async login(req: Request<{}, {}, LoginRequest>, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ message: error.message });
      } else {
        res.status(500).json({ message: '登录失败' });
      }
    }
  }

  static async register(req: Request<{}, {}, RegisterRequest>, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: '注册失败' });
      }
    }
  }

  static async changePassword(req: Request<{}, {}, ChangePasswordRequest>, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: '需要认证' });
      }

      const result = await AuthService.changePassword(req.user.userId, req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: '修改密码失败' });
      }
    }
  }

  static async resetPassword(req: Request<{}, {}, { email: string }>, res: Response) {
    try {
      const result = await AuthService.resetPassword(req.body.email);
      res.json(result);
    } catch (error) {
      // 为了安全，不返回具体错误信息
      res.json({ message: '如果该邮箱存在，重置密码链接将发送到您的邮箱' });
    }
  }
} 