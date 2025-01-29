import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/users';
import { roleRouter } from './routes/roles';
import { permissionRouter } from './routes/permissions';

const app = express();

// 中间件
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: function(origin, callback) {
    // 允许没有 origin 的请求（比如同源请求）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// 基础健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/roles', roleRouter);
app.use('/api/permissions', permissionRouter);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// 错误处理
app.use(errorHandler);

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

// 启动服务器
const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Environment: ${config.env}`);
  console.log(`CORS origins: ${allowedOrigins.join(', ')}`);
}).on('error', (error: NodeJS.ErrnoException) => {
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
}); 