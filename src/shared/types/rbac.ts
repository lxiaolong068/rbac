export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface AssignRoleRequest {
  userId: string;
  roleIds: string[];
}

export interface CreatePermissionRequest {
  name: string;
  description: string;
  resource: string;
  action: Permission['action'];
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  resource?: string;
  action?: Permission['action'];
}

// 用于检查用户是否具有特定权限的工具类型
export type PermissionCheck = {
  resource: string;
  action: Permission['action'];
}; 