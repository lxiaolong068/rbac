import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '../lib/utils';

const menuItems = [
  {
    title: '仪表板',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    title: '用户管理',
    icon: Users,
    path: '/users',
  },
  {
    title: '角色管理',
    icon: ShieldCheck,
    path: '/roles',
  },
  {
    title: '权限管理',
    icon: Settings,
    path: '/permissions',
  },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="bg-texture" />
      <div className="min-h-screen bg-background">
        {/* 左侧菜单 */}
        <aside
          className={cn(
            'fixed left-0 top-0 z-40 h-screen bg-muted border-r border-border transition-all duration-300',
            collapsed ? 'w-16' : 'w-64'
          )}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border gradient-bg">
            {!collapsed && (
              <span className="text-xl font-semibold text-primary">RBAC系统</span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg hover:bg-accent/50"
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5 text-primary" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-primary" />
              )}
            </button>
          </div>

          {/* 菜单项 */}
          <nav className="p-2 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                    'hover:bg-accent hover:text-primary',
                    isActive
                      ? 'bg-accent/50 text-primary'
                      : 'text-muted-foreground'
                  )
                }
              >
                <item.icon className={cn('h-5 w-5', collapsed ? 'mx-auto' : 'mr-3')} />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* 主要内容区域 */}
        <div
          className={cn(
            'transition-all duration-300',
            collapsed ? 'ml-16' : 'ml-64'
          )}
        >
          {/* 顶部导航栏 */}
          <header className="h-16 bg-muted border-b border-border sticky top-0 z-30">
            <div className="h-full px-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-primary">
                {menuItems.find((item) => item.path === location.pathname)?.title || ''}
              </h1>

              {/* 右侧操作区 */}
              <div className="flex items-center space-x-4">
                {/* 主题切换按钮 */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-accent flex items-center justify-center"
                  title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-primary" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary" />
                  )}
                </button>

                {/* 用户信息 */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent">
                    <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {user?.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {user?.username}
                    </span>
                  </button>

                  {/* 下拉菜单 */}
                  <div className="absolute right-0 mt-1 w-48 py-1 bg-muted rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <NavLink
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary"
                    >
                      <User className="h-4 w-4 mr-2" />
                      个人资料
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      退出登录
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* 页面内容 */}
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
} 