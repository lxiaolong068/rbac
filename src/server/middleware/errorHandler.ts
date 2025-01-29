import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public status: 'fail' | 'error' = 'error'
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // 默认错误
  let statusCode = 500;
  let message = '服务器内部错误';
  let status: 'fail' | 'error' = 'error';

  // Zod 验证错误
  if (err instanceof ZodError) {
    statusCode = 400;
    message = '输入验证失败';
    status = 'fail';
    return res.status(statusCode).json({
      status,
      message,
      errors: err.errors,
    });
  }

  // Prisma 错误
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // 唯一约束冲突
    if (err.code === 'P2002') {
      statusCode = 409;
      message = '资源已存在';
      status = 'fail';
    }
    // 记录未找到
    else if (err.code === 'P2025') {
      statusCode = 404;
      message = '资源未找到';
      status = 'fail';
    }
  }

  // 自定义应用错误
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    status = err.status;
  }

  // 发送错误响应
  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
}; 