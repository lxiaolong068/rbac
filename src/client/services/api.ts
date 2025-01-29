import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, User, ApiResponse } from '../../shared/types/auth'

const API_BASE_URL = '/api'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果响应成功，直接返回数据部分
    return response.data
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // 如果收到 401 响应，说明 token 已过期或无效
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    // 统一处理错误消息
    const errorMessage = error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(errorMessage))
  }
)

export interface Stats {
  totalUsers: number
  totalRoles: number
  totalPermissions: number
}

export interface CreateUserData {
  username: string
  password: string
  role: string
}

class ApiService {
  // 认证相关
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    return await api.post('/auth/login', credentials)
  }

  static async register(data: RegisterRequest): Promise<RegisterResponse> {
    return await api.post('/auth/register', data)
  }

  static async logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 用户相关
  static async getUsers(): Promise<User[]> {
    return await api.get('/users')
  }

  static async createUser(userData: CreateUserData): Promise<User> {
    return await api.post('/users', userData)
  }

  static async updateUser(userId: string, userData: Partial<CreateUserData>): Promise<User> {
    return await api.put(`/users/${userId}`, userData)
  }

  static async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`)
  }

  // 统计信息
  static async getStats(): Promise<Stats> {
    return await api.get('/stats')
  }

  // 角色管理
  static async getRoles(): Promise<any[]> {
    return await api.get('/roles')
  }

  static async createRole(data: { name: string; description: string }): Promise<any> {
    return await api.post('/roles', data)
  }

  static async updateRole(id: string, data: { name: string; description: string }): Promise<any> {
    return await api.put(`/roles/${id}`, data)
  }

  static async deleteRole(id: string): Promise<void> {
    await api.delete(`/roles/${id}`)
  }

  // 权限管理
  static async getPermissions(): Promise<any[]> {
    return await api.get('/permissions')
  }

  static async createPermission(data: { name: string; code: string; description: string }): Promise<any> {
    return await api.post('/permissions', data)
  }

  static async updatePermission(id: string, data: { name: string; code: string; description: string }): Promise<any> {
    return await api.put(`/permissions/${id}`, data)
  }

  static async deletePermission(id: string): Promise<void> {
    await api.delete(`/permissions/${id}`)
  }
}

export default ApiService 