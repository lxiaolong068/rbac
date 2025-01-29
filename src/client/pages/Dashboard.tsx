import { useAuth } from '../contexts/AuthContext';
import { Users, ShieldCheck, Key } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">未登录</h2>
          <p className="mt-2 text-sm text-muted-foreground">请先登录后再访问此页面</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card shadow-lg rounded-lg p-6 hover-card border border-border">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-primary">欢迎回来，{user.username}！</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              这是您的个人仪表板。您可以在这里管理您的账户和访问各种功能。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 用户信息卡片 */}
            <div className="bg-muted shadow-lg rounded-lg p-4 border border-border hover-card">
              <div className="flex items-center space-x-3">
                <div className="p-2 gradient-bg rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-primary">用户信息</h3>
              </div>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">用户名</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{user.username}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">电子邮箱</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{user.email}</dd>
                </div>
              </dl>
            </div>

            {/* 角色信息卡片 */}
            <div className="bg-muted shadow-lg rounded-lg p-4 border border-border hover-card">
              <div className="flex items-center space-x-3">
                <div className="p-2 gradient-bg rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-primary">角色</h3>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(user.roles) && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-primary"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">暂无角色</span>
                  )}
                </div>
              </div>
            </div>

            {/* 权限信息卡片 */}
            <div className="bg-muted shadow-lg rounded-lg p-4 border border-border hover-card">
              <div className="flex items-center space-x-3">
                <div className="p-2 gradient-bg rounded-lg">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-primary">权限</h3>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(user.permissions) && user.permissions.length > 0 ? (
                    user.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-primary"
                      >
                        {permission}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">暂无权限</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 