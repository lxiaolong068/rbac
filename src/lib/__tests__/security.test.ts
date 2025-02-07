import { NextRequest, NextResponse } from 'next/server';
import {
  generateToken,
  verifyToken,
  extractToken,
  withPermission,
  generateCSRFToken,
  sanitizeInput,
  escapeSQLInput,
  hashPassword,
  verifyPassword,
} from '../security';

// 模拟 logger
jest.mock('../logger', () => ({
  createErrorLogger: () => ({
    error: jest.fn(),
  }),
}));

describe('Security', () => {
  const mockPayload = {
    userId: '123',
    email: 'test@example.com',
    roles: ['user'],
    permissions: ['read', 'write'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('JWT Functions', () => {
    it('should generate and verify token', () => {
      const token = generateToken(mockPayload);
      expect(token).toBeDefined();
      
      const decoded = verifyToken(token);
      expect(decoded).toMatchObject(mockPayload);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow('Invalid token');
    });
  });

  describe('Token Extraction', () => {
    it('should extract token from authorization header', () => {
      const mockRequest = {
        headers: new Map([
          ['authorization', 'Bearer test-token'],
        ]),
        get: function(key: string) {
          return this.headers.get(key);
        },
      } as unknown as NextRequest;

      const token = extractToken(mockRequest);
      expect(token).toBe('test-token');
    });

    it('should return null for missing authorization header', () => {
      const mockRequest = {
        headers: new Map(),
        get: function(key: string) {
          return this.headers.get(key);
        },
      } as unknown as NextRequest;

      const token = extractToken(mockRequest);
      expect(token).toBeNull();
    });
  });

  describe('Permission Middleware', () => {
    it('should allow access with correct permissions', async () => {
      const mockRequest = {
        headers: new Map([
          ['authorization', 'Bearer ' + generateToken(mockPayload)],
        ]),
        get: function(key: string) {
          return this.headers.get(key);
        },
        set: function(key: string, value: string) {
          this.headers.set(key, value);
        },
      } as unknown as NextRequest;

      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const protectedHandler = withPermission(['read'])(mockHandler);
      await protectedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
    });

    it('should deny access with incorrect permissions', async () => {
      const mockRequest = {
        headers: new Map([
          ['authorization', 'Bearer ' + generateToken(mockPayload)],
        ]),
        get: function(key: string) {
          return this.headers.get(key);
        },
        set: function(key: string, value: string) {
          this.headers.set(key, value);
        },
      } as unknown as NextRequest;

      const mockHandler = jest.fn();
      const protectedHandler = withPermission(['admin'])(mockHandler);
      const response = await protectedHandler(mockRequest);
      const data = await response.json();

      expect(mockHandler).not.toHaveBeenCalled();
      expect(data.error).toBe('权限不足');
    });
  });

  describe('CSRF Protection', () => {
    it('should generate unique CSRF tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize HTML input', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should escape SQL input', () => {
      const input = "'; DROP TABLE users; --";
      const escaped = escapeSQLInput(input);
      expect(escaped).not.toBe(input);
      expect(escaped).toContain("\\'");
    });
  });

  describe('Password Functions', () => {
    it('should hash password consistently', async () => {
      const password = 'test-password';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).toBe(hash2);
    });

    it('should verify password correctly', async () => {
      const password = 'test-password';
      const hashedPassword = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrong-password', hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });
}); 