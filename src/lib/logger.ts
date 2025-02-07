import { NextRequest } from 'next/server';

// 定义日志级别
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 日志接口
interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// 基础日志实现
class BaseLogger implements Logger {
  private context: Record<string, any>;
  private isClient: boolean;

  constructor(context: Record<string, any> = {}) {
    this.context = context;
    this.isClient = typeof window !== 'undefined';
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const contextStr = Object.entries(this.context)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
    
    const logMessage = `[${timestamp}] ${level.toUpperCase()} ${contextStr} ${message}`;
    
    if (this.isClient) {
      // 客户端日志
      switch (level) {
        case 'debug':
          console.debug(logMessage, ...args);
          break;
        case 'info':
          console.log(logMessage, ...args);
          break;
        case 'warn':
          console.warn(logMessage, ...args);
          break;
        case 'error':
          console.error(logMessage, ...args);
          break;
      }
    } else {
      // 服务端日志
      switch (level) {
        case 'debug':
          console.debug(logMessage, ...args);
          break;
        case 'info':
          console.log(logMessage, ...args);
          break;
        case 'warn':
          console.warn(logMessage, ...args);
          break;
        case 'error':
          console.error(logMessage, ...args);
          break;
      }
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }

  child(context: Record<string, any>): Logger {
    return new BaseLogger({ ...this.context, ...context });
  }
}

// 创建基础logger实例
const logger = new BaseLogger();

// 请求上下文logger
export function createRequestLogger(req: NextRequest) {
  return logger.child({
    requestId: req.headers.get('x-request-id') || crypto.randomUUID(),
    method: req.method,
    url: req.url,
    userAgent: req.headers.get('user-agent'),
  });
}

// API路由logger
export function createAPILogger(path: string) {
  return logger.child({
    type: 'api',
    path,
  });
}

// 服务端组件logger
export function createServerComponentLogger(componentName: string) {
  return logger.child({
    type: 'server-component',
    component: componentName,
  });
}

// 错误logger
export function createErrorLogger(context: string) {
  return logger.child({
    type: 'error',
    context,
  });
}

// 性能监控logger
export function createPerformanceLogger() {
  return logger.child({
    type: 'performance',
  });
}

// 导出实例
export default logger; 