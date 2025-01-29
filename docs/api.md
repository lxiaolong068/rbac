# API 接口文档

## 认证接口

### 登录
```
POST /api/auth/login

请求体：
{
    "username": string,
    "password": string,
    "remember": boolean
}

响应：
{
    "token": string,
    "user": {
        "id": string,
        "username": string,
        "email": string
    }
}
```

### 获取当前用户信息
```
GET /api/auth/me

响应：
{
    "id": string,
    "username": string,
    "email": string,
    "roles": [
        {
            "id": string,
            "name": string,
            "description": string
        }
    ]
}
```

## 用户管理

### 获取用户列表
```
GET /api/users

查询参数：
- page: number (默认: 1)
- limit: number (默认: 10)
- search: string

响应：
{
    "items": [
        {
            "id": string,
            "username": string,
            "email": string,
            "roles": [
                {
                    "id": string,
                    "name": string
                }
            ]
        }
    ],
    "total": number,
    "page": number,
    "limit": number
}
```

### 创建用户
```
POST /api/users

请求体：
{
    "username": string,
    "password": string,
    "email": string,
    "roleIds": string[]
}

响应：
{
    "id": string,
    "username": string,
    "email": string
}
```

### 更新用户
```
PUT /api/users/:id

请求体：
{
    "username": string,
    "email": string,
    "roleIds": string[]
}

响应：
{
    "id": string,
    "username": string,
    "email": string
}
```

### 删除用户
```
DELETE /api/users/:id
```

## 角色管理

### 获取角色列表
```
GET /api/roles

查询参数：
- page: number (默认: 1)
- limit: number (默认: 10)
- search: string

响应：
{
    "items": [
        {
            "id": string,
            "name": string,
            "description": string,
            "permissions": [
                {
                    "id": string,
                    "name": string
                }
            ]
        }
    ],
    "total": number,
    "page": number,
    "limit": number
}
```

### 创建角色
```
POST /api/roles

请求体：
{
    "name": string,
    "description": string,
    "permissionIds": string[]
}

响应：
{
    "id": string,
    "name": string,
    "description": string
}
```

### 更新角色
```
PUT /api/roles/:id

请求体：
{
    "name": string,
    "description": string,
    "permissionIds": string[]
}

响应：
{
    "id": string,
    "name": string,
    "description": string
}
```

### 删除角色
```
DELETE /api/roles/:id
```

## 权限管理

### 获取权限列表
```
GET /api/permissions

查询参数：
- page: number (默认: 1)
- limit: number (默认: 10)
- search: string

响应：
{
    "items": [
        {
            "id": string,
            "name": string,
            "description": string,
            "resource": string,
            "action": string
        }
    ],
    "total": number,
    "page": number,
    "limit": number
}
```

## 批量操作

### 批量操作用户
```
POST /api/batch/users

请求体：
{
    "ids": string[],
    "action": "delete" | "disable"
}

响应：
{
    "success": boolean,
    "failedIds": string[],
    "message": string
}
```

说明：
- action=delete：批量删除用户
- action=disable：批量禁用用户
- failedIds：操作失败的用户ID列表

## 错误处理

所有接口在发生错误时返回以下格式：

```json
{
    "error": {
        "code": string,
        "message": string
    }
}
```

### 常见错误码
- 400: 请求参数错误
- 401: 未认证
- 403: 无权限
- 404: 资源不存在
- 409: 资源冲突
- 500: 服务器内部错误

## 认证说明

1. 除登录接口外，所有接口都需要在请求头中携带 Token：
```
Authorization: Bearer <token>
```

2. Token 过期或无效时返回 401 错误

## 最佳实践

1. 使用 HTTPS 确保传输安全
2. 实现请求限流防止滥用
3. 使用合适的缓存策略
4. 遵循 RESTful 设计规范
5. 确保错误信息安全且有意义 