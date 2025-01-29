import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PermissionCheck } from '../../shared/types/rbac';
import { hasPermission, hasRole, hasAnyPermission, hasAllPermissions, hasAnyRole, hasAllRoles } from '../utils/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permissions?: PermissionCheck | PermissionCheck[];
  requireAll?: boolean;
  roles?: string | string[];
  requireAllRoles?: boolean;
  fallback?: ReactNode;
}

export default function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  roles,
  requireAllRoles = false,
  fallback,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const location = useLocation();

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

  // 如果用户没有所需的权限或角色
  if (!checkPermissions() || !checkRoles()) {
    // 如果提供了自定义的 fallback 组件，则显示它
    if (fallback) {
      return <>{fallback}</>;
    }

    // 否则重定向到登录页面，并记录尝试访问的 URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果用户有所需的权限和角色，则渲染子组件
  return <>{children}</>;
} 