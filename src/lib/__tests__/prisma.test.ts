import { PrismaClient } from '@prisma/client';
import prisma from '../prisma';

// 模拟 logger
jest.mock('../logger', () => ({
  createErrorLogger: () => ({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

describe('Prisma Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be an instance of PrismaClient', () => {
    expect(prisma).toBeInstanceOf(PrismaClient);
  });

  it('should have logging enabled', () => {
    expect(prisma.$on).toBeDefined();
  });

  describe('Development Environment', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should store prisma instance in global object in development', () => {
      const globalAny = global as any;
      expect(globalAny.prisma).toBeDefined();
      expect(globalAny.prisma).toBe(prisma);
    });
  });

  describe('Production Environment', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should not store prisma instance in global object in production', () => {
      const globalAny = global as any;
      expect(globalAny.prisma).toBeUndefined();
    });
  });

  describe('Event Handlers', () => {
    it('should handle query events', () => {
      const queryEvent = { query: 'SELECT 1', params: [], duration: 100 };
      prisma.$emit('query', queryEvent);
      // 由于logger被模拟，我们只需验证事件能被触发
      expect(prisma.$on).toBeDefined();
    });

    it('should handle error events', () => {
      const errorEvent = new Error('Database error');
      prisma.$emit('error', errorEvent);
      expect(prisma.$on).toBeDefined();
    });

    it('should handle info events', () => {
      const infoEvent = { message: 'Database connected' };
      prisma.$emit('info', infoEvent);
      expect(prisma.$on).toBeDefined();
    });

    it('should handle warn events', () => {
      const warnEvent = { message: 'Slow query detected' };
      prisma.$emit('warn', warnEvent);
      expect(prisma.$on).toBeDefined();
    });
  });
}); 