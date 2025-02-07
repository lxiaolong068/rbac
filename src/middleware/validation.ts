import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createErrorLogger } from '@/lib/logger';
import { AppError, ErrorCode } from '@/types/error';

const logger = createErrorLogger('validation-middleware');

// 请求验证中间件
export function withValidation(schema: z.ZodSchema) {
  return async function(handler: Function) {
    return async function(req: NextRequest, ...args: any[]) {
      try {
        // 根据请求方法获取需要验证的数据
        let data: any;
        if (req.method === 'GET') {
          // 对于GET请求，验证查询参数
          const url = new URL(req.url);
          data = Object.fromEntries(url.searchParams);
        } else {
          // 对于其他请求方法，验证请求体
          data = await req.json();
        }

        // 使用Zod进行数据验证
        const validatedData = await schema.parseAsync(data);

        // 将验证后的数据添加到请求对象中
        (req as any).validatedData = validatedData;

        // 调用下一个处理器
        return handler(req, ...args);
      } catch (error) {
        logger.error({
          error,
          request: {
            url: req.url,
            method: req.method,
            headers: Object.fromEntries(req.headers),
          },
        });

        if (error instanceof z.ZodError) {
          return NextResponse.json(
            {
              code: ErrorCode.VALIDATION_ERROR,
              message: '请求参数验证失败',
              details: error.errors,
            },
            { status: 422 }
          );
        }

        throw error;
      }
    };
  };
}

// 通用的响应格式化
export function formatResponse(data: any, message: string = '操作成功') {
  return {
    success: true,
    message,
    data,
  };
}

// 响应处理中间件
export function withResponseHandler(handler: Function) {
  return async function(req: NextRequest, ...args: any[]) {
    try {
      const result = await handler(req, ...args);
      
      // 如果已经是 NextResponse，直接返回
      if (result instanceof NextResponse) {
        return result;
      }

      // 格式化响应
      return NextResponse.json(formatResponse(result));
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            code: error.code,
            message: error.message,
            details: error.details,
          },
          { status: error.statusCode }
        );
      }

      logger.error({
        error,
        request: {
          url: req.url,
          method: req.method,
          headers: Object.fromEntries(req.headers),
        },
      });

      return NextResponse.json(
        {
          success: false,
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: '服务器内部错误',
        },
        { status: 500 }
      );
    }
  };
} 