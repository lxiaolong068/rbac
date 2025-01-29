import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import axios from 'axios';
import { config } from '../../core/config';

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化认证状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // 获取用户信息
  const fetchUser = async () => {
    try {
      const { data } = await axios.get(`${config.app.apiPrefix}/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUser(data);
    } catch (error) {
      setError('获取用户信息失败');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post(`${config.app.apiPrefix}/auth/login`, {
        username,
        password
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
    } catch (error) {
      setError('登录失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  // 刷新令牌
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const { data } = await axios.post(`${config.app.apiPrefix}/auth/refresh`, {
        refreshToken
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      return data.token;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // 配置 axios 拦截器
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const token = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshToken]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 