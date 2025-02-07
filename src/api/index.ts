import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 认证路由
router.use('/auth', require('./auth').default);

// 用户路由
router.use('/users', require('./users').default);

// 角色路由
router.use('/roles', require('./roles').default);

// 权限路由
router.use('/permissions', require('./permissions').default);

// 404 处理
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '请求的资源不存在',
    },
  });
});

export default router; 