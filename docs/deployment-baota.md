# 宝塔面板部署指南

本文档针对在 Linux 环境下使用宝塔面板部署 RBAC 权限管理系统，提供详细的部署步骤和解释，适合新手用户阅读。

## 环境准备

1. **安装 Node.js 18.x**
   - 确保您的服务器已经安装 Node.js 18.x 版本。
   - 检查 Node.js 版本：
     ```bash
     node -v
     ```
   - 若未安装，请在宝塔面板中通过“一键安装”或参考官方教程进行安装。

2. **安装 PM2 进程管理器**
   - PM2 用于管理和监控 Node.js 应用。
   - 全局安装 PM2：
     ```bash
     pnpm add -g pm2
     ```
   - 检查安装：
     ```bash
     pm2 -v
     ```

3. **MySQL 数据库配置**
   - 在宝塔面板中确保已安装 MySQL 数据库服务。
   - 创建一个新的数据库（例如：`rbac`），并创建专用的数据库用户，记录好数据库用户名和密码。

## 部署流程

以下步骤将在 Linux 服务器上通过宝塔面板的终端进行，请按以下顺序操作：

1. **克隆项目代码**
   - 打开宝塔面板中的终端或使用 SSH 连接服务器。
   - 运行以下命令将项目克隆到服务器，并进入项目目录：
     ```bash
     git clone https://github.com/your-repo.git
     cd rbac
     ```

2. **安装项目依赖**
   - 使用 pnpm 安装项目所需依赖：
     ```bash
     pnpm install
     ```
   - 此过程可能需要几分钟，请耐心等待。

3. **构建项目**
   - 运行项目构建命令：
     ```bash
     pnpm build
     ```
   - 构建成功后，会在 `dist/` 目录下生成后端代码（通常文件位于 `dist/server/index.js`）。

   **可选方案：本地构建后上传 `dist` 目录进行部署**
   - 在本地执行：
     ```bash
     pnpm build
     ```
   - 使用 SCP、FTP 或其他工具，将整个 `dist` 文件夹上传至服务器指定目录，例如 `/path/to/rbac/dist`。
   - 在服务器上，通过以下命令使用 PM2 启动应用（假设应用入口文件位于 `dist/server/index.js`）：
     ```bash
     pm2 start /path/to/rbac/dist/server/index.js --name "rbac" --cwd /path/to/rbac/dist
     ```
   - 确认 PM2 启动成功后，可以继续配置 Nginx 反向代理。

4. **配置环境变量**
   - 在宝塔面板中找到项目的环境变量设置，或者直接编辑项目根目录下的 `.env` 文件。
   - 确保设置以下关键环境变量：
     - `DATABASE_URL`：例如 `mysql://username:password@localhost:3306/rbac`，请将 `username` 和 `password` 替换为您创建的数据库用户信息。
     - `NODE_ENV`：设置为 `production`
     - 其他变量请参照 `.env.example` 文件。
   - 保存并确保环境变量已生效。

5. **使用 PM2 启动项目**
   - 通过 PM2 启动后端服务时，需要指定启动文件的位置以及项目的运行目录。如果您的项目结构发生变化或者启动文件不在默认位置，可以通过 PM2 的 `--cwd` 选项或者使用 `ecosystem.config.js` 文件来指定。

   - **示例 1：直接通过命令行指定**
     ```bash
     pm2 start dist/server/index.js --name "rbac" --cwd /path/to/rbac
     ```
     其中，`/path/to/rbac` 是您项目的根目录，请根据实际路径替换。

   - **示例 2：使用 ecosystem.config.js 文件配置**
     创建一个 `ecosystem.config.js` 文件，内容如下：
     ```javascript
     module.exports = {
       apps: [
         {
           name: "rbac",
           script: "dist/server/index.js",
           cwd: "/path/to/rbac", // 设置项目运行目录
           env: {
             NODE_ENV: "production"
           }
         }
       ]
     };
     ```
     然后使用以下命令启动应用：
     ```bash
     pm2 start ecosystem.config.js
     ```

   - 使用以下命令查看 PM2 状态确认应用已启动：
     ```bash
     pm2 list
     ```

6. **配置宝塔面板中的 Nginx 反向代理**
   - 登录宝塔面板，进入 Nginx 或 Apache 配置页面。
   - 添加反向代理规则，将外部请求转发到 Node.js 服务端口（例如 3000）：
     ```nginx
     location / {
       proxy_pass http://localhost:3000;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     }
     ```
   - 保存配置并重启 Web 服务器，使配置生效。

## 常见问题及解决方案

1. **依赖安装或构建失败**
   - 检查 Node.js 和 pnpm 是否正确安装并符合要求。
   - 确保网络连接稳定，如遇网络问题，可尝试使用国内镜像或代理工具。

2. **PM2 启动问题**
   - 使用命令 `pm2 logs rbac` 查看详细错误信息。
   - 检查 `dist/server/index.js` 文件是否正确生成。

3. **Nginx 反向代理无效**
   - 检查防火墙设置，确保允许 Node.js 服务使用的端口（如3000）通信。
   - 确认 Nginx 配置语法正确，并重启 Nginx 服务。

## 附加提示

- 在宝塔面板操作时，推荐使用面板自带的终端或通过 SSH 工具连接服务器。
- 遇到问题时，可查阅宝塔官方文档或相关技术论坛获取更多帮助。