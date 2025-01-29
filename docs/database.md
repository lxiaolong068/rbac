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

## 性能优化指南

### 索引优化
1. 用户表查询优化
```sql
-- 用户创建时间索引，优化按时间范围查询
CREATE INDEX idx_users_created ON "User"("createdAt");

-- 用户名和邮箱联合索引，优化登录和搜索
CREATE INDEX idx_users_username_email ON "User"("username", "email");
```

2. 角色权限关联查询优化
```prisma
model RolePermission {
  @@index([roleId, permissionId])
}

model UserRole {
  @@index([userId, roleId])
}
```

### 查询优化建议
1. 分页查询使用游标分页代替偏移分页
2. 避免 N+1 查询问题，使用 include 预加载关联数据
3. 合理使用复合索引减少回表查询
4. 对于大数据量查询，使用流式查询或分批处理

## 数据库备份与恢复

### 自动备份脚本
```bash
#!/bin/bash
# backup.sh

# 配置变量
DB_USER=$DB_USER
DB_HOST=$DB_HOST
DB_NAME=$DB_NAME
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
pg_dump -U $DB_USER -h $DB_HOST -Fc $DB_NAME > $BACKUP_DIR/backup_$DATE.dump

# 保留最近30天的备份
find $BACKUP_DIR -name "backup_*.dump" -mtime +30 -delete
```

### 备份计划
1. 每日增量备份：每天凌晨2点执行
2. 每周全量备份：每周日凌晨3点执行
3. 异地备份：将备份文件同步到远程存储

### 恢复流程
```bash
# 恢复数据库
pg_restore -U $DB_USER -h $DB_HOST -d $DB_NAME backup.dump

# 验证数据一致性
pnpm prisma validate
```

### 性能监控
1. 使用 pg_stat_statements 监控慢查询
2. 定期分析查询计划，优化性能瓶颈
3. 监控连接池使用情况和等待事件 