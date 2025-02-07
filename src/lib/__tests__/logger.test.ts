import { NextRequest } from 'next/server';
import logger, {
  createRequestLogger,
  createAPILogger,
  createServerComponentLogger,
  createErrorLogger,
  createPerformanceLogger,
} from '../logger';

// 模拟 NextRequest
const mockNextRequest = {
  headers: new Map([
    ['x-request-id', '123'],
    ['user-agent', 'test-agent'],
  ]),
  method: 'GET',
  url: 'http://localhost:3000/test',
  get: function(key: string) {
    return this.headers.get(key);
  },
} as unknown as NextRequest;

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Base Logger', () => {
    it('should be defined', () => {
      expect(logger).toBeDefined();
    });

    it('should have correct log level based on environment', () => {
      const isDev = process.env.NODE_ENV === 'development';
      expect(logger.level).toBe(isDev ? 'debug' : 'info');
    });
  });

  describe('Request Logger', () => {
    it('should create request logger with correct context', () => {
      const requestLogger = createRequestLogger(mockNextRequest);
      expect(requestLogger).toBeDefined();
      // 验证是否包含请求相关信息
      expect(requestLogger.bindings()).toMatchObject({
        requestId: '123',
        method: 'GET',
        url: 'http://localhost:3000/test',
        userAgent: 'test-agent',
      });
    });

    it('should generate requestId if not provided', () => {
      const reqWithoutId = {
        ...mockNextRequest,
        headers: new Map([['user-agent', 'test-agent']]),
      } as unknown as NextRequest;
      const requestLogger = createRequestLogger(reqWithoutId);
      const bindings = requestLogger.bindings();
      expect(bindings.requestId).toBeDefined();
      expect(typeof bindings.requestId).toBe('string');
    });
  });

  describe('API Logger', () => {
    it('should create API logger with correct path', () => {
      const path = '/api/test';
      const apiLogger = createAPILogger(path);
      expect(apiLogger.bindings()).toMatchObject({
        type: 'api',
        path,
      });
    });
  });

  describe('Server Component Logger', () => {
    it('should create server component logger with correct name', () => {
      const componentName = 'TestComponent';
      const componentLogger = createServerComponentLogger(componentName);
      expect(componentLogger.bindings()).toMatchObject({
        type: 'server-component',
        component: componentName,
      });
    });
  });

  describe('Error Logger', () => {
    it('should create error logger with correct context', () => {
      const context = 'test-context';
      const errorLogger = createErrorLogger(context);
      expect(errorLogger.bindings()).toMatchObject({
        type: 'error',
        context,
      });
    });
  });

  describe('Performance Logger', () => {
    it('should create performance logger with correct type', () => {
      const perfLogger = createPerformanceLogger();
      expect(perfLogger.bindings()).toMatchObject({
        type: 'performance',
      });
    });
  });
}); 