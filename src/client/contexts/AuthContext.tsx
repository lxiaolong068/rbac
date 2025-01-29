import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginRequest, User } from '../../shared/types/auth';
import ApiService from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 从 storage 恢复认证状态
    const restoreAuth = () => {
      // 优先从 sessionStorage 恢复
      let storedToken = sessionStorage.getItem('token');
      let storedUser = sessionStorage.getItem('user');

      // 如果 sessionStorage 没有，则尝试从 localStorage 恢复
      if (!storedToken || !storedUser) {
        storedToken = localStorage.getItem('token');
        storedUser = localStorage.getItem('user');
      }

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
        } catch (err) {
          // 如果解析失败，清除所有存储的认证信息
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        }
      }

      setLoading(false);
    };

    restoreAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.login(data);
      
      // 验证响应数据
      if (!response || !response.data || !response.data.user || !response.data.token) {
        setError('登录响应数据无效');
        return;
      }
      
      const { user, token } = response.data;
      
      // 设置状态
      setUser(user);
      setToken(token);
      
      // 总是在 sessionStorage 中保存登录状态
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      // 如果选择了"记住我"，则同时保存到 localStorage
      if (data.remember) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (err: any) {
      const errorMessage = err.message || '登录失败，请检查用户名和密码';
      setError(errorMessage);
      return;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // 清除所有存储的认证信息
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 