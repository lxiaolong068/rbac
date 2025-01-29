# 数据库说明文档

## 数据库架构

### 用户表 (User)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | VARCHAR | 用户名 |
| password | VARCHAR | 加密后的密码 |
| email | VARCHAR | 电子邮件 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

### 角色表 (Role)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR | 角色名称 |
| description | TEXT | 角色描述 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

### 权限表 (Permission)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR | 权限名称 |
| description | TEXT | 权限描述 |
| resource | VARCHAR | 资源类型 |
| action | VARCHAR | 操作类型 |
| createdAt | TIMESTAMP | 创建时间 |
| updatedAt | TIMESTAMP | 更新时间 |

### 用户角色关联表 (UserRole)
| 字段 | 类型 | 说明 |
|------|------|------|
| userId | UUID | 用户ID |
| roleId | UUID | 角色ID |
| createdAt | TIMESTAMP | 创建时间 |

### 角色权限关联表 (RolePermission)
| 字段 | 类型 | 说明 |
|------|------|------|
| roleId | UUID | 角色ID |
| permissionId | UUID | 权限ID |
| createdAt | TIMESTAMP | 创建时间 |

## 数据库初始化

### 初始化命令
```bash
# 完整初始化（迁移 + 生成客户端 + 填充数据）
pnpm db:init

# 生产环境初始化
pnpm db:init:prod

# 重置数据库
pnpm db:reset

# 仅填充数据
pnpm db:seed
```

### 初始化流程
1. 运行数据库迁移
2. 生成 Prisma 客户端
3. 清理现有数据（如果需要）
4. 创建初始权限
5. 创建管理员角色
6. 创建管理员用户

### 默认管理员账户
- 用户名：admin
- 密码：admin123

## 常见问题处理

### 1. 迁移失败
```bash
# 重置迁移历史
pnpm prisma migrate reset

# 重新生成迁移
pnpm prisma migrate dev
```

### 2. 客户端生成失败
```bash
# 清理生成的文件
rm -rf node_modules/.prisma

# 重新安装依赖
pnpm install

# 重新生成客户端
pnpm prisma generate
```

### 3. 数据不一致
```bash
# 验证数据库架构
pnpm prisma validate

# 重置数据库
pnpm db:reset
```

## 开发建议

1. 使用事务确保数据一致性
2. 定期备份数据库
3. 生产环境谨慎使用重置命令
4. 遵循最小权限原则
5. 使用索引优化查询性能 