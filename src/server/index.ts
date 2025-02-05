import fastify, { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import userRouter from './routes/users';
import roleRouter from './routes/roles';
import permissionRouter from './routes/permissions';

const app = fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  },
  bodyLimit: 1048576, // 1MB
  ajv: {
    customOptions: {
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: true,
      allErrors: true,
    }
  }
});

// 注册插件
async function bootstrap() {
  try {
    // 请求体解析
    await app.addContentTypeParser('application/json', { parseAs: 'string' }, async (req: FastifyRequest, body: string) => {
      try {
        return body.length > 0 ? JSON.parse(body as string) : {};
      } catch (err) {
        throw new Error('Invalid JSON');
      }
    });

    // CORS配置
    await app.register(cors, {
      origin: (origin, cb) => {
        const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
          cb(null, true);
          return;
        }
        cb(new Error('Not allowed by CORS'), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // 安全头
    await app.register(helmet);

    // 压缩
    await app.register(compress);

    // 健康检查
    app.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // API路由
    app.register(authRouter, { prefix: '/api/auth' });
    app.register(userRouter, { prefix: '/api/users' });
    app.register(roleRouter, { prefix: '/api/roles' });
    app.register(permissionRouter, { prefix: '/api/permissions' });

    // 404处理
    app.setNotFoundHandler((request, reply) => {
      reply.code(404).send({
        status: 'error',
        message: `Cannot ${request.method} ${request.url}`,
      });
    });

    // 错误处理
    app.setErrorHandler(errorHandler);

    // 优雅关闭
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      await app.close();
      process.exit(0);
    });

    // 启动服务器
    try {
      await app.listen({ port: config.port });
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment: ${config.env}`);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'EADDRINUSE') {
        console.error(`\x1b[31m错误: 端口 ${config.port} 已被占用\x1b[0m`);
        console.log('\n请按照以下步骤操作：');
        console.log('1. 使用命令 \x1b[33mtaskkill /F /IM node.exe\x1b[0m 关闭所有 Node.js 进程');
        console.log('2. 重新运行 \x1b[33mpnpm dev\x1b[0m 启动开发服务器\n');
        process.exit(1);
      } else {
        console.error('服务器启动失败:', error);
        process.exit(1);
      }
    }
  } catch (err) {
    console.error('启动过程中出错:', err);
    process.exit(1);
  }
}

bootstrap(); 