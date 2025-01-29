import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// 权限验证模式
const permissionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['system', 'tenant', 'project']),
  actions: z.array(z.string()).min(1, 'At least one action is required')
});

// 权限验证中间件
export const validatePermission = (req: Request, res: Response, next: NextFunction) => {
  try {
    permissionSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: error.errors 
      });
    } else {
      next(error);
    }
  }
};
