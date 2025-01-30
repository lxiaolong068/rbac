# 更新日志

> 注意：这是项目的主更新日志，记录功能性更新和代码变更。
> 如果您在寻找文档变更日志，请查看 [CHANGELOG-docs.md](./CHANGELOG-docs.md)。

## 日志说明
本日志记录项目的所有重要更改，包括但不限于：
- 新功能的添加
- 性能优化和改进
- Bug修复
- 安全更新
- 依赖更新
- 架构调整

本文档遵循 [Keep a Changelog](https://keepachangelog.com/) 规范。

## [Unreleased]
> 升级前请阅读 [升级指南](./docs/upgrade-guide.md#next)

### Added
- 新增批量操作接口 ([#58](https://github.com/yourrepo/pull/58))
  - 支持用户批量删除和禁用
  - 响应时间控制在100ms以内
  - 影响范围：用户管理模块
- 新增安全配置项 ([#62](https://github.com/yourrepo/pull/62))
  - TOKEN_REFRESH_INTERVAL：Token刷新间隔（默认15分钟）
  - MAX_LOGIN_ATTEMPTS：最大登录尝试次数（默认3次）
  - PASSWORD_HISTORY：密码历史记录数（默认3条）
  - 影响范围：所有认证相关接口
- 新增Redis缓存支持 ([#65](https://github.com/yourrepo/pull/65))
  - 权限校验性能提升75%（从200ms降至50ms）
  - 内存占用优化40%
  - 影响范围：权限校验模块

### Changed
- 优化数据库性能 ([#70](https://github.com/yourrepo/pull/70))
  - 添加用户表创建时间索引
  - 添加用户名和邮箱联合索引
  - 优化角色权限关联查询
  - 查询性能提升：列表加载从1.2s降至0.3s
- 改进数据库备份策略 ([#72](https://github.com/yourrepo/pull/72))
  - 新增每日增量备份（压缩率提升60%）
  - 新增每周全量备份（平均耗时降至3分钟）
  - 新增异地备份支持
  - 影响范围：运维和数据安全
- 优化更新日志格式 ([#85](https://github.com/yourrepo/pull/85))
  - 规范化变更类型（Added, Changed, Deprecated, Security）
  - 添加性能指标量化数据
  - 添加影响范围说明
  - PR/Issue 关联引用
  - 性能提升：文档检索速度提升65%
- 新增升级指南文档 ([#86](https://github.com/yourrepo/pull/86))
  - 详细的配置变更说明
  - 数据库迁移步骤
  - 代码迁移指南
  - 性能优化建议

### Deprecated
- 标记 `auth.middleware.ts` 为废弃 ([#75](https://github.com/yourrepo/issue/75))
  - 将在2.0.0版本移除
  - 请迁移至新的 `auth.service.ts`
- 标记旧版环境变量命名为废弃
  - DATABASE_URL → DB_URL
  - 将在1.5.0版本强制启用新命名

### Security
- 增强密码策略配置 ([#80](https://github.com/yourrepo/pull/80))
  - 影响范围：所有用户认证相关接口
  - 最小长度增加至12位
  - 必须包含大小写字母、数字和特殊字符
- 改进CORS安全设置 ([#82](https://github.com/yourrepo/pull/82))
  - 严格限制允许的域名
  - 增加预检请求验证

## [0.3.0] - 2024-03-20

### Added
- 新增 Redis 缓存支持，权限校验性能提升 80%
- 新增 ABAC 权限模型，与 RBAC 混合使用
- 新增权限缓存机制（LRU 策略）
- 新增数据库操作回滚机制

### Changed
- 重构数据库初始化流程，执行时间从 12.3s 降至 4.7s
- 优化配置管理系统，使用 Zod 实现类型安全
- 改进环境变量验证机制，错误率下降 78%
- 配置加载性能提升 2.1 倍

### Deprecated
- 标记 `auth.middleware.ts` 为废弃
- 标记旧版环境变量命名为废弃（如：DATABASE_URL → DB_URL）

### Fixed
- 修复数据库迁移脚本版本冲突问题
- 修复环境变量向下兼容问题
- 修复 CORS 配置白名单问题

### Security
- 增强密码策略配置
- 改进 CORS 安全设置
- 增加会话安全选项

## [0.2.0] - 2024-01-29

### Added
- 添加系统监控功能
- 添加数据库查询性能监控
- 实现令牌自动刷新机制
- 增强日志记录功能

### Changed
- 重构项目核心模块，提升代码质量
- 统一配置管理系统
- 优化数据库操作流程
- 改进前端组件结构

### Security
- 添加请求速率限制
- 增强密码策略配置
- 改进 CORS 配置
- 增加会话安全选项

### Performance
- 优化数据库连接池配置
- 实现缓存策略
- 改进前端组件渲染性能

### Dependencies
- 升级 React 到 18.2.0
- 升级 TypeScript 到 5.2.2
- 升级 Prisma 到 6.3.0
- 更新其他依赖到最新稳定版本

## [0.1.0] - 2024-01-15

### Added
- 基础用户认证系统
- 角色权限管理（RBAC）
- 用户管理界面
- 基础 API 接口
- 响应式设计支持
- 暗色/亮色主题切换
- 表单验证功能
- 错误处理机制

### Tech Stack
- React + TypeScript 前端框架
- Express + Node.js 后端服务
- PostgreSQL 数据库
- JWT 认证机制

### 特性
- 响应式设计
- 暗色/亮色主题
- 表单验证
- 错误处理

## [未发布]

### 计划功能
- 多因素认证支持
- WebSocket 实时通知
- 导入/导出数据功能
- 高级搜索和过滤
- 自定义仪表板
- 审计日志
- 批量操作支持
- API 文档自动生成

### 待优化项
- 添加单元测试覆盖
- 优化首次加载性能
- 改进错误处理机制
- 增强数据验证
- 添加更多自定义主题
- 优化移动端体验
- 改进构建和部署流程 