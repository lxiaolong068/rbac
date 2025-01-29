import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ErrorResponse } from '../../shared/types/auth';

const API_BASE = '/api';

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('服务器返回格式错误');
      }

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('用户名或密码错误');
        }
        throw new Error(result.message || '登录失败');
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('登录请求失败');
    }
  }

  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('服务器返回格式错误');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '注册失败');
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('注册请求失败');
    }
  }

  static async logout(): Promise<void> {
    // 清除本地存储的token和用户信息
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  static getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
} 