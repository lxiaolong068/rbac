'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Stepper, Step, StepLabel, TextField, Alert, CircularProgress } from '@mui/material'
import { createAPILogger } from '@/lib/logger'

const logger = createAPILogger('setup-wizard')

const steps = [
  '环境检查',
  '数据库配置',
  '管理员设置',
  '完成初始化'
]

export default function SetupWizard() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // 数据库配置
    dbHost: '',
    dbPort: '3306',
    dbName: '',
    dbUser: '',
    dbPassword: '',
    // 管理员配置
    adminUsername: '',
    adminPassword: '',
    adminEmail: '',
  })

  const handleNext = async () => {
    try {
      setError(null)
      setLoading(true)

      if (activeStep === 0) {
        // 环境检查
        const res = await fetch('/api/setup/check-env')
        const data = await res.json()
        if (!data.success) {
          throw new Error(data.message || '环境检查失败')
        }
      } else if (activeStep === 1) {
        // 验证数据库配置
        if (!formData.dbHost || !formData.dbPort || !formData.dbName || !formData.dbUser || !formData.dbPassword) {
          throw new Error('请填写所有数据库配置字段')
        }
        
        // 构建数据库连接URL
        const dbUrl = `mysql://${formData.dbUser}:${formData.dbPassword}@${formData.dbHost}:${formData.dbPort}/${formData.dbName}`
        
        // 测试数据库连接
        const res = await fetch('/api/setup/check-database', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dbUrl }),
        })
        const data = await res.json()
        if (!data.success) {
          throw new Error(data.message || '数据库连接失败')
        }
      } else if (activeStep === 2) {
        // 表单验证
        if (!formData.adminUsername || !formData.adminPassword || !formData.adminEmail) {
          throw new Error('请填写所有必填字段')
        }
        if (!formData.adminEmail.includes('@')) {
          throw new Error('请输入有效的邮箱地址')
        }
        if (formData.adminPassword.length < 6) {
          throw new Error('密码长度至少为6个字符')
        }

        // 创建管理员账户
        const res = await fetch('/api/setup/create-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.adminUsername,
            password: formData.adminPassword,
            email: formData.adminEmail,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          throw new Error(data.message || '管理员账户创建失败')
        }
      }

      setActiveStep((prev) => prev + 1)
    } catch (err) {
      logger.error('Setup wizard error: ' + (err instanceof Error ? err.message : String(err)))
      setError(err instanceof Error ? err.message : '初始化过程出错')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    router.push('/login')
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">环境检查</h2>
            <p>正在检查系统环境...</p>
            {loading && <CircularProgress size={24} className="mt-4" />}
          </div>
        )
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">数据库配置</h2>
            <TextField
              fullWidth
              label="数据库主机"
              value={formData.dbHost}
              onChange={(e) => setFormData(prev => ({ ...prev, dbHost: e.target.value }))}
              required
              disabled={loading}
              className="mb-4"
              placeholder="localhost"
            />
            <TextField
              fullWidth
              label="端口"
              value={formData.dbPort}
              onChange={(e) => setFormData(prev => ({ ...prev, dbPort: e.target.value }))}
              required
              disabled={loading}
              className="mb-4"
              placeholder="3306"
            />
            <TextField
              fullWidth
              label="数据库名"
              value={formData.dbName}
              onChange={(e) => setFormData(prev => ({ ...prev, dbName: e.target.value }))}
              required
              disabled={loading}
              className="mb-4"
              placeholder="rbac"
            />
            <TextField
              fullWidth
              label="用户名"
              value={formData.dbUser}
              onChange={(e) => setFormData(prev => ({ ...prev, dbUser: e.target.value }))}
              required
              disabled={loading}
              className="mb-4"
              placeholder="root"
            />
            <TextField
              fullWidth
              label="密码"
              type="password"
              value={formData.dbPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, dbPassword: e.target.value }))}
              required
              disabled={loading}
              className="mb-4"
            />
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">管理员设置</h2>
            <TextField
              fullWidth
              label="用户名"
              value={formData.adminUsername}
              onChange={(e) => setFormData(prev => ({ ...prev, adminUsername: e.target.value }))}
              required
              disabled={loading}
              className="mb-4"
            />
            <TextField
              fullWidth
              label="密码"
              type="password"
              value={formData.adminPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
              required
              disabled={loading}
              className="mb-4"
              helperText="密码长度至少为6个字符"
            />
            <TextField
              fullWidth
              label="邮箱"
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
              required
              disabled={loading}
            />
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">初始化完成</h2>
            <p>系统已成功初始化，请使用管理员账户登录。</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div className="mt-8">
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <div className="mt-8 flex justify-end">
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleFinish}
              disabled={loading}
            >
              前往登录
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? '处理中...' : '下一步'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 