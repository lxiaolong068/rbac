# RBAC 权限管理系统

一个基于 React + TypeScript + Node.js 的现代化权限管理系统。

## 文档导航

- [配置说明文档](docs/config.md) - 详细的系统配置说明
- [数据库说明文档](docs/database.md) - 数据库架构和操作指南
- [API 接口文档](docs/api.md) - 完整的 API 接口说明
- [Vercel部署指南](docs/deployment-vercel.md)
- [宝塔部署指南](docs/deployment-baota.md)
- [更新日志](docs/changelog.md) - 版本更新记录和计划功能

## 功能特性

### 认证功能
- [x] 用户登录
  - 表单验证
  - 记住登录状态
  - 优雅的错误提示
  - 自动 Token 管理
- [ ] 忘记密码
- [x] 自动登出（Token 过期）

### 用户管理
- [x] 用户列表
- [x] 创建用户
- [x] 编辑用户
- [x] 删除用户

### 角色管理
- [x] 角色列表
- [x] 创建角色
- [x] 编辑角色
- [x] 删除角色

### 权限管理
- [x] 权限列表
- [x] 创建权限
- [x] 编辑权限
- [x] 删除权限

### UI/UX
- [x] 响应式设计
- [x] 暗色/亮色主题
- [x] 优雅的过渡动画
- [x] Toast 消息提示
- [x] 加载状态展示
- [x] 表单验证反馈

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- React Router v6
- Tailwind CSS
- Lucide Icons
- Axios

### 后端
- Node.js
- Fastify
- TypeScript
- PostgreSQL
- Prisma
- JWT 认证
- Zod 验证
- Pino 日志

## 快速开始

1. 克隆仓库
```bash
git clone <repository-url>
cd rbac
```

2. 安装依赖
```bash
pnpm install
```

3. 环境变量配置
```bash
cp .env.example .env
```
编辑 .env 文件，配置必要的环境变量。详细配置说明请参考[配置说明文档](docs/config.md)。

4. 初始化数据库
```bash
pnpm db:init
```
数据库相关操作请参考[数据库说明文档](docs/database.md)。

5. 启动开发服务器
```bash
# 同时启动前端和后端服务
pnpm dev

# 只启动前端
pnpm dev:client

# 只启动后端
pnpm dev:server
```

## 项目结构

```
src/
├── client/              # 前端代码
│   ├── components/      # 可复用组件
│   ├── contexts/        # React Context
│   ├── hooks/          # 自定义 Hooks
│   ├── lib/            # 工具函数
│   ├── pages/          # 页面组件
│   └── services/       # API 服务
├── server/             # 后端代码
│   ├── config/         # 配置文件
│   ├── lib/            # 工具函数
│   ├── middleware/     # 中间件
│   └── routes/         # 路由定义
└── shared/            # 前后端共享代码
    └── types/         # TypeScript 类型定义
```

## 部署指南

### 生产环境部署

1. 构建项目
```bash
pnpm build
```

2. 启动服务
```bash
pnpm start
```

### 多平台部署指南

#### Vercel 部署
1. 安装Vercel CLI：`pnpm add -g vercel`
2. 配置环境变量：
```bash
vercel env add DATABASE_URL production
vercel env add NODE_ENV production
```
3. 适配配置：
```js
// vite.config.ts
export default defineConfig({
  server: { port: process.env.PORT || 3000 } // 兼容Vercel动态端口
})
```

#### 宝塔面板部署
1. 安装基础环境：
```bash
# Node.js 18.x
pnpm env use --global 18
# MySQL/PostgreSQL 根据选择安装
```
2. PM2配置：
```json
{
  "name": "rbac",
  "script": "dist/server/index.js",
  "env": {
    "DATABASE_URL": "mysql://user:pass@localhost:3306/db"
  }
}
```
3. Nginx反向代理配置示例：
```nginx
location / {
  proxy_pass http://localhost:3000;
  proxy_set_header Host $host;
}
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交改动 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 许可证

MIT 