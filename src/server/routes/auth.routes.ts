import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// 公开路由
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/reset-password', AuthController.resetPassword);

// 需要认证的路由
router.post('/change-password', authenticate, AuthController.changePassword);

export default router; 