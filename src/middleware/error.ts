import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AppError, ErrorCode } from '@/types/error';
import { createErrorLogger } from '@/lib/logger';

const logger = createErrorLogger('error-middleware');

export async function errorHandler(
  error: Error | AppError,
  req: NextRequest
): Promise<NextResponse> {
  // 如果是我们的应用错误类型
  if (error instanceof AppError) {
    logger.error({
      code: error.code,
      message: error.message,
      details: error.details,
      stack: error.stack,
      request: {
        url: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers),
      },
    });

    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  // 处理未知错误
  logger.error({
    error: error,
    request: {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers),
    },
  });

  // 在生产环境中隐藏错误详情
  const response = {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : error.message,
  };

  if (process.env.NODE_ENV === 'development') {
    (response as any).stack = error.stack;
  }

  return NextResponse.json(response, { status: 500 });
}

// 高阶函数：包装路由处理器以添加错误处理
export function withErrorHandling(handler: Function) {
  return async function(req: NextRequest, ...args: any[]) {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return errorHandler(error as Error, req);
    }
  };
}

// 用于API路由的错误处理装饰器
export function ApiErrorHandler() {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const [req] = args;
        return errorHandler(error as Error, req);
      }
    };

    return descriptor;
  };
} 