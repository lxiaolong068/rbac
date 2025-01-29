import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserService } from '../services/user.service.js';

const userService = new UserService();

export class AuthController {
  /**
   * 登录验证规则
   */
  static loginValidationRules = [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ];

  /**
   * 修改密码验证规则
   */
  static changePasswordValidationRules = [
    body('oldPassword').notEmpty().withMessage('原密码不能为空'),
    body('newPassword')
      .notEmpty().withMessage('新密码不能为空')
      .isLength({ min: 6 }).withMessage('新密码长度不能小于6位'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('两次输入的密码不一致');
      }
      return true;
    }),
  ];

  /**
   * 用户登录
   */
  async login(req: Request, res: Response) {
    try {
      // 验证请求数据
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;
      const result = await userService.login(username, password);

      // 设置登录IP
      await userService.updateLoginIP(result.user.id, req.ip);

      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: '服务器内部错误' });
      }
    }
  }

  /**
   * 修改密码
   */
  async changePassword(req: Request, res: Response) {
    try {
      // 验证请求数据
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { oldPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(403).json({ message: '需要登录后访问' });
      }

      await userService.changePassword(userId, oldPassword, newPassword);
      res.json({ message: '密码修改成功' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: '服务器内部错误' });
      }
    }
  }

  /**
   * 重置密码（管理员功能）
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { userId, newPassword } = req.body;
      const operatorId = req.user?.id;

      if (!operatorId) {
        return res.status(403).json({ message: '需要登录后访问' });
      }

      await userService.resetPassword(userId, newPassword, operatorId);
      res.json({ message: '密码重置成功' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: '服务器内部错误' });
      }
    }
  }
} 