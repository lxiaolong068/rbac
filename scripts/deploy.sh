#!/bin/bash

# 设置错误时退出
set -e

# 加载环境变量
source .env.production

# 颜色输出函数
print_info() {
    echo -e "\e[34m[INFO] $1\e[0m"
}

print_success() {
    echo -e "\e[32m[SUCCESS] $1\e[0m"
}

print_error() {
    echo -e "\e[31m[ERROR] $1\e[0m"
}

# 检查数据库类型
check_database_type() {
    print_info "检查数据库配置..."
    
    if [ "$DATABASE_PROVIDER" != "mysql" ] && [ "$DATABASE_PROVIDER" != "postgresql" ]; then
        print_error "不支持的数据库类型: $DATABASE_PROVIDER"
        exit 1
    fi
    
    print_success "数据库类型: $DATABASE_PROVIDER"
}

# 数据库备份
backup_database() {
    print_info "开始备份数据库..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
    
    if [ "$DATABASE_PROVIDER" = "mysql" ]; then
        # MySQL 备份
        mysqldump -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" > "$BACKUP_FILE"
    else
        # PostgreSQL 备份
        PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}" > "$BACKUP_FILE"
    fi
    
    if [ $? -eq 0 ]; then
        print_success "数据库备份完成: $BACKUP_FILE"
        # 压缩备份文件
        gzip "$BACKUP_FILE"
    else
        print_error "数据库备份失败"
        exit 1
    fi
}

# 检查必要的目录是否存在
check_directories() {
    print_info "检查必要目录..."
    
    # 创建日志目录
    mkdir -p "$LOG_DIR"
    chmod 755 "$LOG_DIR"
    
    # 创建上传目录
    mkdir -p "$UPLOAD_DIR"
    chmod 755 "$UPLOAD_DIR"
    
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    chmod 755 "$BACKUP_DIR"
    
    print_success "目录检查完成"
}

# 安装依赖
install_dependencies() {
    print_info "安装项目依赖..."
    npm ci --production
    print_success "依赖安装完成"
}

# 构建项目
build_project() {
    print_info "构建项目..."
    npm run build
    print_success "项目构建完成"
}

# 数据库迁移
run_migrations() {
    print_info "运行数据库迁移..."
    npx prisma migrate deploy
    print_success "数据库迁移完成"
}

# 重启服务
restart_service() {
    print_info "重启服务..."
    
    # 如果使用 PM2
    if command -v pm2 &> /dev/null; then
        pm2 restart rbac-api
    else
        # 如果使用 systemd
        sudo systemctl restart rbac-api
    fi
    
    print_success "服务重启完成"
}

# 健康检查
health_check() {
    print_info "执行健康检查..."
    
    MAX_RETRIES=5
    RETRY_INTERVAL=3
    
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -s "http://localhost:$PORT/api/health" | grep -q "ok"; then
            print_success "服务运行正常"
            return 0
        fi
        
        print_info "等待服务启动... ($i/$MAX_RETRIES)"
        sleep $RETRY_INTERVAL
    done
    
    print_error "服务健康检查失败"
    exit 1
}

# 主函数
main() {
    print_info "开始部署流程..."
    
    check_database_type
    check_directories
    backup_database
    install_dependencies
    build_project
    run_migrations
    restart_service
    health_check
    
    print_success "部署完成!"
}

# 执行主函数
main 