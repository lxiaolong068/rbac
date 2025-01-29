import express, { Request, Response, NextFunction } from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import authRoutes from './server/routes/auth.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保跨平台路径兼容性
const PUBLIC_DIR = join(__dirname, '..', 'public');
const INDEX_HTML = join(PUBLIC_DIR, 'index.html');

const app = express();
const prisma = new PrismaClient();

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API 路由
app.use('/api/auth', authRoutes);

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'RBAC API Documentation',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        changePassword: 'POST /api/auth/change-password',
        resetPassword: 'POST /api/auth/reset-password'
      },
      users: {
        list: 'GET /api/users',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      }
    }
  });
});

// 静态文件服务
app.use(express.static(PUBLIC_DIR));

// 所有其他路由返回 index.html（支持前端路由）
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(INDEX_HTML);
});

// 错误处理中间件
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to database');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap(); 