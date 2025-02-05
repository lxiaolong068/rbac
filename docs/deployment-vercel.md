# Vercel 部署指南

本文档详细描述如何将 RBAC 权限管理系统部署到 Vercel 平台上。

## 前提条件
- 已安装 pnpm 全局包管理器（建议使用最新版本）。
- 已在 Vercel 平台上创建账号，并安装 Vercel CLI。

## 部署步骤

### 1. 安装 Vercel CLI
在命令行执行以下命令以全局安装 Vercel CLI：

```bash
pnpm add -g vercel
```

### 2. 配置环境变量
在 Vercel 的项目设置中添加以下环境变量：

- `DATABASE_URL`：数据库连接字符串。例如：
  ```
  mysql://rbac:password@localhost:3306/rbac
  ```
- `NODE_ENV`：设置为 `production`。
- `JWT_SECRET`：配置您的 JWT 秘钥（请使用强随机字符串）。

其他与项目相关的环境变量可参照项目根目录中的 `.env.example` 文件进行配置。

### 3. 部署项目
在项目根目录下运行以下命令进行部署：

```bash
vercel --prod
```

根据提示选择相应的项目和部署配置，Vercel 将自动构建并部署项目。

### 4. 部署后确认
- 登录 Vercel 控制台查看部署状态和日志。
- 若需更新部署，修改代码后重新运行 `vercel --prod` 命令。

## 常见问题

- **构建失败**：检查依赖是否安装正确，并确认所有必需环境变量已在 Vercel 上配置。
- **运行错误**：查看 Vercel 部署日志，依据错误提示进行排查。

## 其他提示

- 开发过程中建议使用 `vercel dev` 命令进行本地调试，确保本地配置与生产环境一致。
- 更多信息请参阅 [Vercel 官方文档](https://vercel.com/docs)。