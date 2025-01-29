import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PermissionCheck } from '../../shared/types/rbac';
import { hasPermission, hasRole, hasAnyPermission, hasAllPermissions, hasAnyRole, hasAllRoles } from '../utils/permissions';

interface PermissionGateProps {
  children: ReactNode;
  permissions?: PermissionCheck | PermissionCheck[];
  requireAll?: boolean;
  roles?: string | string[];
  requireAllRoles?: boolean;
  fallback?: ReactNode;
}

/**
 * 条件渲染组件，根据用户的权限和角色控制内容的显示
 * 
 * @example
 * // 基本用法
 * <PermissionGate permissions={{ resource: 'users', action: 'create' }}>
 *   <button>创建用户</button>
 * </PermissionGate>
 * 
 * // 多个权限（任意一个）
 * <PermissionGate
 *   permissions={[
 *     { resource: 'users', action: 'update' },
 *     { resource: 'users', action: 'delete' }
 *   ]}
 * >
 *   <button>管理用户</button>
 * </PermissionGate>
 * 
 * // 多个权限（全部需要）
 * <PermissionGate
 *   permissions={[
 *     { resource: 'users', action: 'create' },
 *     { resource: 'roles', action: 'create' }
 *   ]}
 *   requireAll
 * >
 *   <button>高级操作</button>
 * </PermissionGate>
 * 
 * // 角色检查
 * <PermissionGate roles="admin">
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * // 带有后备内容
 * <PermissionGate
 *   permissions={{ resource: 'posts', action: 'create' }}
 *   fallback={<p>您没有权限创建文章</p>}
 * >
 *   <CreatePostForm />
 * </PermissionGate>
 */
export default function PermissionGate({
  children,
  permissions,
  requireAll = false,
  roles,
  requireAllRoles = false,
  fallback = null,
}: PermissionGateProps) {
  const { user } = useAuth();

  // 检查权限
  const checkPermissions = () => {
    if (!permissions) return true;

    if (Array.isArray(permissions)) {
      return requireAll
        ? hasAllPermissions(user, permissions)
        : hasAnyPermission(user, permissions);
    }

    return hasPermission(user, permissions);
  };

  // 检查角色
  const checkRoles = () => {
    if (!roles) return true;

    if (Array.isArray(roles)) {
      return requireAllRoles
        ? hasAllRoles(user, roles)
        : hasAnyRole(user, roles);
    }

    return hasRole(user, roles);
  };

  // 如果用户有所需的权限和角色，则渲染子组件
  if (checkPermissions() && checkRoles()) {
    return <>{children}</>;
  }

  // 否则渲染后备内容
  return <>{fallback}</>;
} 