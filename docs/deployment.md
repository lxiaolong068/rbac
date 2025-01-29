# 部署指南

本文档详细说明了系统的部署流程、环境要求和注意事项。

## 环境要求

### 系统要求
- Node.js >= 16.0.0
- PostgreSQL >= 14.0
- pnpm >= 8.0.0

### 硬件推荐配置
- CPU: 2核心及以上
- 内存: 4GB及以上
- 硬盘: 20GB可用空间

### 网络要求
- 固定IP地址
- 开放必要端口（默认3000）
- HTTPS证书（生产环境必需）

## 部署流程

### 1. 准备工作

1. 安装 Node.js
```bash
# 使用 nvm 安装 Node.js
nvm install 16
nvm use 16
```

2. 安装 pnpm
```bash
npm install -g pnpm
```

3. 安装 PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
```

### 2. 获取代码

1. 克隆仓库
```bash
git clone <repository-url>
cd rbac
```

2. 切换到稳定版本
```bash
git checkout $(git describe --tags --abbrev=0)
```

### 3. 环境配置

1. 创建生产环境配置
```bash
cp .env.example .env.production
```

2. 修改生产环境配置
```bash
# 编辑 .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/rbac
JWT_SECRET=your-secure-secret
CORS_ORIGIN=https://your-domain.com
```

3. 配置数据库
```bash
# 登录 PostgreSQL
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE rbac;
CREATE USER rbac_user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE rbac TO rbac_user;
```

### 4. 安装依赖

```bash
pnpm install --production
```

### 5. 数据库初始化

```bash
# 运行数据库迁移
pnpm db:init:prod
```

### 6. 构建项目

```bash
pnpm build
```

### 7. 配置进程管理

使用 PM2 管理 Node.js 进程：

1. 安装 PM2
```bash
npm install -g pm2
```

2. 创建 PM2 配置文件 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [{
    name: 'rbac',
    script: 'dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production'
    },
    max_memory_restart: '1G'
  }]
}
```

3. 启动服务
```bash
pm2 start ecosystem.config.js --env production
```

### 8. 配置反向代理

使用 Nginx 作为反向代理：

1. 安装 Nginx
```bash
sudo apt install nginx   # Ubuntu/Debian
sudo yum install nginx  # CentOS/RHEL
```

2. 配置 Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 重定向 HTTP 到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    # SSL 配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # 安全headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    # 反向代理配置
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. 重启 Nginx
```bash
sudo systemctl restart nginx
```

## 监控和维护

### 1. 日志管理
```bash
# 查看应用日志
pm2 logs rbac

# 查看 Nginx 访问日志
tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### 2. 性能监控
```bash
# 查看进程状态
pm2 monit

# 查看性能统计
pm2 status
```

### 3. 备份策略
```bash
# 备份数据库
pg_dump -U rbac_user rbac > backup.sql

# 还原数据库
psql -U rbac_user rbac < backup.sql
```

### 4. 更新部署
```bash
# 拉取最新代码
git pull

# 安装依赖
pnpm install --production

# 构建项目
pnpm build

# 重启服务
pm2 reload rbac
```

## 安全建议

1. 使用强密码和密钥
2. 定期更新系统和依赖
3. 启用防火墙，只开放必要端口
4. 配置 SSL/TLS 证书
5. 实施访问控制和 IP 白名单
6. 定期备份数据
7. 监控系统异常

## 故障排除

### 1. 服务无法启动
- 检查端口占用
- 验证环境变量配置
- 检查日志文件

### 2. 数据库连接失败
- 验证数据库凭证
- 检查网络连接
- 确认数据库服务状态

### 3. 性能问题
- 检查服务器资源使用
- 优化数据库查询
- 调整 Node.js 内存限制

## 参考资源

- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [PM2 文档](https://pm2.keymetrics.io/)
- [Nginx 文档](https://nginx.org/en/docs/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/) 