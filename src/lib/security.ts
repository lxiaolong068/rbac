import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createErrorLogger } from './logger';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const logger = createErrorLogger('security');

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

// Token验证Schema
const tokenPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});

type TokenPayload = z.infer<typeof tokenPayloadSchema>;

// 生成JWT token
export function generateToken(payload: TokenPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (error) {
    logger.error({ error }, 'Failed to generate token');
    throw new Error('Token generation failed');
  }
}

// 验证JWT token
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return tokenPayloadSchema.parse(decoded);
  } catch (error) {
    logger.error({ error }, 'Token verification failed');
    throw new Error('Invalid token');
  }
}

// 从请求中提取token
export function extractToken(req: NextRequest): string | null {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  } catch (error) {
    logger.error({ error }, 'Failed to extract token');
    return null;
  }
}

// 权限检查中间件
export function withPermission(requiredPermissions: string[]) {
  return async function(handler: Function) {
    return async function(req: NextRequest, ...args: any[]) {
      try {
        const token = extractToken(req);
        if (!token) {
          return NextResponse.json(
            { error: '未授权访问' },
            { status: 401 }
          );
        }

        const payload = verifyToken(token);
        
        // 检查是否具有所需权限
        const hasPermission = requiredPermissions.every(
          permission => payload.permissions.includes(permission)
        );

        if (!hasPermission) {
          return NextResponse.json(
            { error: '权限不足' },
            { status: 403 }
          );
        }

        // 将用户信息添加到请求中
        req.headers.set('x-user-id', payload.userId);
        req.headers.set('x-user-email', payload.email);
        req.headers.set('x-user-roles', payload.roles.join(','));

        return handler(req, ...args);
      } catch (error) {
        logger.error({ error }, 'Permission check failed');
        return NextResponse.json(
          { error: '权限验证失败' },
          { status: 401 }
        );
      }
    };
  };
}

// CSRF保护
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

// XSS清理函数
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// SQL注入防护
export function escapeSQLInput(input: string): string {
  return input
    .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
      switch (char) {
        case '\0':
          return '\\0';
        case '\x08':
          return '\\b';
        case '\x09':
          return '\\t';
        case '\x1a':
          return '\\z';
        case '\n':
          return '\\n';
        case '\r':
          return '\\r';
        case '"':
        case "'":
        case '\\':
        case '%':
          return '\\' + char;
        default:
          return char;
      }
    });
}

// 密码加密
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 密码验证
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
} 