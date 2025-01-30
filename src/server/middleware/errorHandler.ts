import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
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

interface FastifyErrorWithStatusCode extends FastifyError {
  statusCode?: number;
}

export const errorHandler = (
  err: FastifyErrorWithStatusCode | Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error({
    err: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err instanceof AppError && { statusCode: err.statusCode, status: err.status }),
    },
    request: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
      body: request.body,
      headers: {
        ...request.headers,
        authorization: request.headers.authorization ? '[REDACTED]' : undefined,
      },
    },
  });

  // 默认错误
  let statusCode = 500;
  let message = '服务器内部错误';
  let status: 'fail' | 'error' = 'error';
  let details: any = undefined;

  // Zod 验证错误
  if (err instanceof ZodError) {
    statusCode = 400;
    message = '输入验证失败';
    status = 'fail';
    details = err.errors;
  }
  // Prisma 错误
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // 唯一约束冲突
    if (err.code === 'P2002') {
      statusCode = 409;
      message = '资源已存在';
      status = 'fail';
      details = err.meta;
    }
    // 记录未找到
    else if (err.code === 'P2025') {
      statusCode = 404;
      message = '资源未找到';
      status = 'fail';
      details = err.meta;
    }
  }
  // 自定义应用错误
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    status = err.status;
  }
  // Fastify 错误
  else if ('statusCode' in err) {
    statusCode = err.statusCode || 500;
    message = err.message;
    status = 'error';
  }

  // 发送错误响应
  return reply.code(statusCode).send({
    status,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err.name,
    }),
  });
}; 