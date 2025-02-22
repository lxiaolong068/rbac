'use client'

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { createUser } from '@/app/api/users/actions'

interface Role {
  id: string
  name: string
}

export default function CreateUserButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roleIds: [] as string[],
  })
  const [error, setError] = useState('')
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      const data = await response.json()
      setRoles(data)
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    }
  }

  const handleOpen = () => {
    setOpen(true)
    fetchRoles()
  }

  const handleClose = () => {
    setOpen(false)
    setFormData({
      username: '',
      email: '',
      password: '',
      roleIds: [],
    })
    setError('')
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRoleChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      roleIds: event.target.value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => formDataObj.append(key, v))
        } else {
          formDataObj.append(key, value)
        }
      })

      const result = await createUser(formDataObj)

      if (result.success) {
        handleClose()
        router.refresh()
      } else {
        setError(result.error || '创建用户失败')
      }
    } catch (error) {
      setError('创建用户时发生错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpen}
      >
        新建用户
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>新建用户</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                name="username"
                label="用户名"
                value={formData.username}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="email"
                label="邮箱"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="password"
                label="密码"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>角色</InputLabel>
                <Select
                  multiple
                  value={formData.roleIds}
                  onChange={handleRoleChange}
                  label="角色"
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>取消</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? '创建中...' : '创建'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
} 