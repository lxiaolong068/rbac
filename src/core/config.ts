import { z } from 'zod';
import { config as dotenv } from 'dotenv';

// 根据环境加载对应的配置文件
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv({ path: envFile });

// 统一的配置schema
const configSchema = z.object({
  // 应用配置
  app: z.object({
    env: z.enum(['development', 'production', 'test']).default('development'),
    port: z.number().default(3000),
    vitePort: z.number().default(5173),
    apiPrefix: z.string().default('/api'),
  }),

  // 数据库配置
  database: z.object({
    url: z.string(),
    maxConnections: z.number().default(10),
    idleTimeout: z.number().default(30000),
  }),

  // 认证配置
  auth: z.object({
    jwt: z.object({
      secret: z.string(),
      expiresIn: z.string().default('7d'),
      refreshExpiresIn: z.string().default('30d'),
    }),
    bcrypt: z.object({
      saltRounds: z.number().default(10),
    }),
  }),

  // 安全配置
  security: z.object({
    cors: z.object({
      origin: z.string().default('http://localhost:5173'),
      credentials: z.boolean().default(true),
    }),
    rateLimit: z.object({
      windowMs: z.number().default(15 * 60 * 1000), // 15 minutes
      max: z.number().default(100), // 每个IP的最大请求数
    }),
  }),

  // 会话配置
  session: z.object({
    key: z.string().default('koa.sess'),
    maxAge: z.number().default(86400000), // 24h
    httpOnly: z.boolean().default(true),
    secure: z.boolean().default(process.env.NODE_ENV === 'production'),
  }),

  // 日志配置
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    filePath: z.string().optional(),
    format: z.enum(['json', 'text']).default('json'),
  }),

  // 缓存配置
  cache: z.object({
    driver: z.enum(['memory', 'redis']).default('memory'),
    redis: z.object({
      host: z.string().optional(),
      port: z.number().optional(),
      password: z.string().optional(),
    }).optional(),
    ttl: z.number().default(300), // 5 minutes
  }),

  // 监控配置
  monitoring: z.object({
    enabled: z.boolean().default(false),
    interval: z.number().default(60000), // 1 minute
  }),
});

// 验证并转换环境变量
const envConfig = {
  app: {
    env: process.env.NODE_ENV,
    port: Number(process.env.PORT),
    vitePort: Number(process.env.VITE_PORT),
    apiPrefix: process.env.API_PREFIX,
  },
  database: {
    url: process.env.DATABASE_URL,
    maxConnections: Number(process.env.DB_MAX_CONNECTIONS),
    idleTimeout: Number(process.env.DB_IDLE_TIMEOUT),
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    },
    bcrypt: {
      saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS),
    },
  },
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
    rateLimit: {
      windowMs: Number(process.env.RATE_LIMIT_WINDOW),
      max: Number(process.env.RATE_LIMIT_MAX),
    },
  },
  session: {
    key: process.env.SESSION_KEY,
    maxAge: Number(process.env.SESSION_MAX_AGE),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
  logging: {
    level: process.env.LOG_LEVEL as any,
    filePath: process.env.LOG_FILE_PATH,
    format: process.env.LOG_FORMAT as any,
  },
  cache: {
    driver: process.env.CACHE_DRIVER as any,
    redis: process.env.CACHE_DRIVER === 'redis' ? {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    } : undefined,
    ttl: Number(process.env.CACHE_TTL),
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    interval: Number(process.env.MONITORING_INTERVAL),
  },
};

// 验证配置
export const config = configSchema.parse(envConfig);

// 导出类型
export type AppConfig = z.infer<typeof configSchema>; 