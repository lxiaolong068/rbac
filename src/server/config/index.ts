import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL || 'mysql://rbac:CGJDF37DYjGPJyDc@43.159.53.148:3306/rbac',
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: '24h', // 默认token过期时间
  },
  
  // 密码加密配置
  bcrypt: {
    saltRounds: 10,
  },
  
  // 跨域配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
