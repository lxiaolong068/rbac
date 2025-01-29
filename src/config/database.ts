import { PrismaClient } from '@prisma/client';

// 数据库连接配置
interface DatabaseConfig {
  provider: 'mysql' | 'postgresql' | 'sqlite';
  url: string;
  host?: string;
  port?: number;
  name?: string;
  user?: string;
  password?: string;
}

// 从环境变量获取数据库配置
const getDatabaseConfig = (): DatabaseConfig => {
  const provider = process.env.DATABASE_PROVIDER as DatabaseConfig['provider'];
  
  if (!provider) {
    throw new Error('DATABASE_PROVIDER environment variable is not set');
  }

  const config: DatabaseConfig = {
    provider,
    url: process.env.DATABASE_URL || '',
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : undefined,
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  };

  if (!config.url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  return config;
};

// 创建 Prisma 客户端实例
const createPrismaClient = () => {
  const config = getDatabaseConfig();
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: config.url,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // 添加中间件用于日志记录
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });

  return prisma;
};

// 导出数据库配置和客户端创建函数
export const dbConfig = getDatabaseConfig();
export const prisma = createPrismaClient();

// 确保在应用退出时关闭数据库连接
process.on('beforeExit', async () => {
  await prisma.$disconnect();
}); 