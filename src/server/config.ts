import { z } from 'zod';
import { config as dotenv } from 'dotenv';

// 加载环境变量
dotenv();

// 环境变量验证schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  VITE_PORT: z.string().transform(Number).default('5173'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default('10'),
  TOKEN_REFRESH_INTERVAL: z.string().default('15m'),
  MAX_LOGIN_ATTEMPTS: z.string().transform(Number).default('3'),
  PASSWORD_HISTORY: z.string().transform(Number).default('3'),
  REDIS_URL: z.string().optional(),
});

// 验证环境变量
const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  vitePort: env.VITE_PORT,
  db: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshInterval: env.TOKEN_REFRESH_INTERVAL,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  bcrypt: {
    saltRounds: env.BCRYPT_SALT_ROUNDS,
  },
  security: {
    maxLoginAttempts: env.MAX_LOGIN_ATTEMPTS,
    passwordHistory: env.PASSWORD_HISTORY,
  },
  redis: {
    url: env.REDIS_URL,
  },
} as const;

export const sessionConfig = {
  key: 'koa.sess',
  maxAge: 86400000,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  // 确保以下配置正确
  renew: false,  // 关闭自动续期
  rolling: false // 关闭滚动续期
} 