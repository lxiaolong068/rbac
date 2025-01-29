import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth';
import { validatePermission } from '../middleware/validation';

const router = express.Router();
const prisma = new PrismaClient();

// 获取所有权限
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const permissions = await prisma.permission.findMany();
    res.json(permissions);
  } catch (error) {
    next(error);
  }
});

// 获取单个权限
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const permission = await prisma.permission.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    res.json(permission);
  } catch (error) {
    next(error);
  }
});

// 创建新权限
router.post('/', verifyToken, validatePermission, async (req, res, next) => {
  try {
    const { name, description, type, actions } = req.body;
    const permission = await prisma.permission.create({
      data: {
        name,
        description,
        type,
        actions
      }
    });
    res.status(201).json(permission);
  } catch (error) {
    next(error);
  }
});

// 更新权限
router.put('/:id', verifyToken, validatePermission, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, type, actions } = req.body;
    
    const permission = await prisma.permission.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        type,
        actions
      }
    });
    
    res.json(permission);
  } catch (error) {
    next(error);
  }
});

// 删除权限
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.permission.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as permissionRouter };
