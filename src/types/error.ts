export enum ErrorCode {
  // 系统错误 (1000-1999)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // 认证错误 (2000-2999)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  FORBIDDEN = 'FORBIDDEN',
  
  // 用户错误 (3000-3999)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  
  // 角色权限错误 (4000-4999)
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // 请求错误 (5000-5999)
  BAD_REQUEST = 'BAD_REQUEST',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(code: ErrorCode, message: string, statusCode: number = 500, details?: Record<string, any>) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
    
    // 确保正确的原型链
    Object.setPrototypeOf(this, AppError.prototype);
  }

  public toJSON(): ErrorResponse {
    const response: ErrorResponse = {
      code: this.code,
      message: this.message,
    };

    if (this.details) {
      response.details = this.details;
    }

    if (process.env.NODE_ENV === 'development') {
      response.stack = this.stack;
    }

    return response;
  }

  // 预定义的错误创建方法
  static badRequest(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCode.BAD_REQUEST, message, 400, details);
  }

  static unauthorized(message: string = '未授权访问', details?: Record<string, any>): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401, details);
  }

  static forbidden(message: string = '权限不足', details?: Record<string, any>): AppError {
    return new AppError(ErrorCode.FORBIDDEN, message, 403, details);
  }

  static notFound(message: string = '资源不存在', details?: Record<string, any>): AppError {
    return new AppError(ErrorCode.RESOURCE_NOT_FOUND, message, 404, details);
  }

  static validationError(message: string, details?: Record<string, any>): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 422, details);
  }

  static internal(message: string = '服务器内部错误', details?: Record<string, any>): AppError {
    return new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details);
  }
} 