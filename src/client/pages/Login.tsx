import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoginRequest } from '../../shared/types/auth'
import { Toast } from '../components/Toast'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, error } = useAuth()
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)

  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
    remember: false,
  })

  // 监听 error 变化，显示错误提示
  useEffect(() => {
    if (error) {
      setToast({
        type: 'error',
        message: error,
      })
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // 阻止表单默认提交行为
    
    // 表单验证
    if (!formData.username.trim()) {
      setToast({
        type: 'error',
        message: '请输入用户名',
      })
      return
    }
    
    if (!formData.password.trim()) {
      setToast({
        type: 'error',
        message: '请输入密码',
      })
      return
    }

    try {
      await login(formData)
      
      // 如果没有错误，说明登录成功
      if (!error) {
        // 登录成功后，重定向到用户之前尝试访问的页面，或默认到仪表板
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
      }
    } catch (err) {
      // 由于 login 函数不再抛出错误，这里不会执行到
      // 错误处理已经在 AuthContext 中完成
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-lg shadow-lg">
        {toast && (
          <div className="mb-6">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={5000}
              onClose={() => setToast(null)}
              className="w-full"
            />
          </div>
        )}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            管理员登录
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            请输入您的管理员账号和密码
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className="form-input rounded-t-md rounded-b-none"
                placeholder="用户名"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="form-input rounded-t-none rounded-b-md"
                placeholder="密码"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-muted rounded"
                checked={formData.remember}
                onChange={handleChange}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-foreground">
                记住我
              </label>
            </div>

            <div className="text-sm">
              <button type="button" className="font-medium text-primary hover:text-primary/80">
                忘记密码？
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 