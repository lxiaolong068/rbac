import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { verifyToken, hasPermission } from '../middlewares/auth.middleware.js';

const router = Router();
const authController = new AuthController();

// 登录路由
router.post('/login', AuthController.loginValidationRules, authController.login);

// 修改密码路由（需要登录）
router.post(
  '/change-password',
  verifyToken,
  AuthController.changePasswordValidationRules,
  authController.changePassword
);

// 重置密码路由（需要管理员权限）
router.post(
  '/reset-password',
  verifyToken,
  hasPermission(['user:update']),
  authController.resetPassword
);

export default router; 