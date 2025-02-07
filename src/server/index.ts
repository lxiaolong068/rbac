import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { join } from 'path';
import { logger } from '../lib/logger';

const fastify = Fastify({
  logger: logger,
});

// 注册插件
async function registerPlugins() {
  // 压缩
  await fastify.register(compress);

  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // 安全头
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });
}

// 注册路由
async function registerRoutes() {
  // 健康检查
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API 路由
  fastify.register(require('../api').default, { prefix: '/api' });
}

// 启动服务器
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    const port = parseInt(process.env.PORT || '3000');
    const address = await fastify.listen({ port });
    console.log(`Server is running at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await fastify.close();
  process.exit(0);
});

start(); 