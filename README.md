# RBAC (Role-Based Access Control) 系统

一个基于 Next.js 14 的现代化 RBAC 权限管理系统，采用 App Router 架构实现全栈开发。

## 功能特性

- 🔐 完整的 RBAC 权限控制
  - 细粒度的权限管理
  - 动态权限分配
  - 权限继承支持
  - 多维度权限校验
- 🚀 现代化技术栈
  - Next.js 14 App Router
  - React Server Components
  - TypeScript 类型安全
  - Prisma ORM
- 🎨 优秀的用户体验
  - Material UI + Tailwind CSS
  - 响应式设计
  - 主题定制
  - 动态路由
- 🛡️ 企业级安全保障
  - XSS/CSRF 防护
  - SQL 注入防护
  - 密码加密存储
  - 敏感数据保护
- 📊 完善的日志系统
  - 操作日志记录
  - 权限变更追踪
  - 登录日志
  - 性能监控
- 💾 高性能数据存储
  - MySQL/PostgreSQL 支持
  - 多级缓存设计
  - 读写分离支持
  - 数据库索引优化
- 🧪 完整的测试支持
  - Jest 单元测试
  - React Testing Library
  - E2E 测试支持
  - 测试覆盖率报告

## 技术栈

### 核心框架
- ✅ Next.js 14 (App Router)
- ✅ React 18
- ✅ TypeScript 5
- ✅ Prisma ORM

### 前端技术
- ✅ Material UI
- ✅ Tailwind CSS
- ✅ React Query
- ✅ React Hook Form
- ✅ Zod 验证

### 后端技术
- ✅ Node.js
- ✅ MySQL/PostgreSQL
- ✅ Redis (可选)
- ✅ JWT 认证

### 开发工具
- ✅ ESLint
- ✅ Prettier
- ✅ Jest
- ✅ React Testing Library

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0 或 PostgreSQL >= 14
- pnpm >= 8.0
- Redis >= 6.0 (可选)

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/your-username/rbac-system.git
cd rbac-system
```

2. 安装依赖
```bash
pnpm install
```

3. 环境配置
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，配置必要的环境变量：
# DATABASE_URL="mysql://user:password@localhost:3306/rbac"
# JWT_SECRET="your-jwt-secret"
# NEXTAUTH_SECRET="your-nextauth-secret"
# NEXTAUTH_URL="http://localhost:3000"
# REDIS_URL="redis://localhost:6379" (可选)
```

4. 数据库迁移
```bash
# 生成迁移文件
pnpm prisma generate

# 执行迁移
pnpm prisma migrate dev
```

5. 启动开发服务器
```bash
pnpm dev
```

6. 系统初始化
访问 http://localhost:3000，系统会自动检测初始化状态：
- 首次访问时会自动跳转到初始化向导
- 按照向导完成环境检查、数据库配置和管理员账户创建
- 初始化完成后即可使用管理员账户登录系统

### 项目结构

```
src/
├── app/          # Next.js 14 App Router 路由
├── components/   # React 组件
│   ├── client/   # 客户端组件
│   └── server/   # 服务端组件
├── lib/          # 工具库
│   ├── auth/     # 认证相关
│   ├── cache/    # 缓存系统
│   ├── db/       # 数据库操作
│   └── logger/   # 日志系统
├── types/        # TypeScript 类型定义
└── middleware/   # Next.js 中间件
```

## 核心功能

### 系统初始化
- 环境自检
- 数据库配置检查
- 管理员账户设置
- 初始化状态管理

### 用户管理
- 用户 CRUD
- 密码管理
- 角色分配
- 状态管理

### 角色管理
- 角色 CRUD
- 权限分配
- 角色继承
- 角色同步

### 权限管理
- 权限 CRUD
- 权限组
- 权限检查
- 权限缓存

### 系统功能
- 操作日志
- 登录日志
- 性能监控
- 系统配置

## 开发指南

### 代码规范
```bash
# 运行代码检查
pnpm lint

# 运行代码格式化
pnpm format
```

### 测试
```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test <测试文件路径>

# 生成测试覆盖率报告
pnpm test:coverage
```

### 构建
```bash
# 构建生产版本
pnpm build

# 运行生产版本
pnpm start
```

## 部署指南

### 传统部署
1. 构建项目
```bash
pnpm build
```

2. 配置生产环境变量
```bash
cp .env.example .env.production
# 编辑 .env.production
```

3. 启动服务
```bash
pnpm start
```

### Docker 部署
```bash
# 构建镜像
docker build -t rbac-system .

# 运行容器
docker run -p 3000:3000 rbac-system
```

## 性能优化

- ✅ 多级缓存设计
- ✅ 组件懒加载
- ✅ 图片优化
- ✅ API 路由缓存
- ✅ 数据预取
- ✅ 静态页面生成

## 安全措施

- ✅ XSS 防护
- ✅ CSRF 防护
- ✅ SQL 注入防护
- ✅ 密码加密
- ✅ 请求限流
- ✅ 会话管理

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 问题反馈

如果你发现了 bug 或有新功能建议，欢迎提交 issue。