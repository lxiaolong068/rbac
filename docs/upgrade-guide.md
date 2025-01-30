# 升级指南

本文档提供了项目各版本间的升级说明，包括破坏性变更、配置调整和迁移步骤。

## [Next]

### 配置变更
1. 新增环境变量
```env
TOKEN_REFRESH_INTERVAL=15m
MAX_LOGIN_ATTEMPTS=3
PASSWORD_HISTORY=3
REDIS_URL=redis://localhost:6379
```

2. 环境变量命名调整
```diff
- DATABASE_URL=postgresql://user:pass@localhost:5432/db
+ DB_URL=postgresql://user:pass@localhost:5432/db
```

### 数据库变更
1. 新增索引
```sql
-- 需要手动执行或通过迁移脚本
CREATE INDEX idx_users_created ON "User"("createdAt");
CREATE INDEX idx_users_username_email ON "User"("username", "email");
```

2. 权限表结构调整
```sql
-- 将在下个版本自动迁移
ALTER TABLE "Permission" ADD COLUMN "scope" VARCHAR;
```

### 代码迁移
1. 认证中间件迁移
```diff
- import { authMiddleware } from './auth.middleware';
+ import { AuthService } from './auth.service';

- app.use(authMiddleware());
+ app.use(AuthService.middleware());
```

### 性能优化
1. Redis缓存配置
```typescript
// config/redis.ts
export const redisConfig = {
  url: process.env.REDIS_URL,
  maxMemory: '512mb',
  maxMemoryPolicy: 'allkeys-lru'
};
```

### 安全增强
1. 密码策略调整
- 最小长度：12位
- 必须包含：大小写字母、数字、特殊字符
- 不能使用最近3次使用过的密码

2. CORS配置更新
```typescript
// config/cors.ts
export const corsConfig = {
  origin: ['https://your-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false
};
``` 