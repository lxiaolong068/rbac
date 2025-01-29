import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface SecurityCheck {
  type: 'permission' | 'role';
  values: string[];
  requireAll?: boolean;
}

interface SecurityGateProps {
  checks: SecurityCheck[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SecurityGate: React.FC<SecurityGateProps> = ({
  checks,
  children,
  fallback = null
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  const passed = checks.every(check => {
    const values = check.type === 'permission' ? user.permissions : user.roles;
    
    if (!values) {
      return false;
    }

    return check.requireAll
      ? check.values.every(v => values.includes(v))
      : check.values.some(v => values.includes(v));
  });

  return passed ? children : fallback;
};

// 预定义的权限检查组件
export const RequirePermissions: React.FC<{
  permissions: string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permissions, requireAll = true, children, fallback }) => (
  <SecurityGate
    checks={[{ type: 'permission', values: permissions, requireAll }]}
    fallback={fallback}
  >
    {children}
  </SecurityGate>
);

// 预定义的角色检查组件
export const RequireRoles: React.FC<{
  roles: string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ roles, requireAll = true, children, fallback }) => (
  <SecurityGate
    checks={[{ type: 'role', values: roles, requireAll }]}
    fallback={fallback}
  >
    {children}
  </SecurityGate>
);

// 组合检查组件
export const RequireMultiple: React.FC<{
  permissions?: string[];
  roles?: string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permissions, roles, requireAll = true, children, fallback }) => {
  const checks: SecurityCheck[] = [];
  
  if (permissions) {
    checks.push({ type: 'permission', values: permissions, requireAll });
  }
  
  if (roles) {
    checks.push({ type: 'role', values: roles, requireAll });
  }

  return (
    <SecurityGate checks={checks} fallback={fallback}>
      {children}
    </SecurityGate>
  );
}; 