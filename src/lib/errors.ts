// 基础错误类
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

// 认证错误
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED')
  }
}

// 授权错误
export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 403, 'PERMISSION_DENIED')
  }
}

// 验证错误
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_FAILED')
  }
}

// 资源不存在错误
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

// 资源冲突错误
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT')
  }
}

// 数据库错误
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR')
  }
}

// API 错误处理函数
export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        error: {
          message: error.message,
          code: error.code
        }
      }
    }
  }

  // 处理 Prisma 错误
  if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
    return {
      status: 400,
      body: {
        error: {
          message: 'Database operation failed',
          code: 'DATABASE_ERROR'
        }
      }
    }
  }

  // 处理其他未知错误
  console.error('Unhandled error:', error)
  return {
    status: 500,
    body: {
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    }
  }
}

// 错误响应格式化
export function formatErrorResponse(error: AppError) {
  return {
    error: {
      message: error.message,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  }
} 