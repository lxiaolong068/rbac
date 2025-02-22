'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  Box,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { deleteUser } from '@/app/api/users/actions'

interface Role {
  id: string
  name: string
}

interface User {
  id: string
  username: string
  email: string
  roles: Array<{
    role: Role
  }>
  createdAt: string
}

interface UserListProps {
  users: User[]
  total: number
  page: number
  pageSize: number
}

export default function UserList({ users, total, page, pageSize }: UserListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  const handleChangePage = (_: unknown, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage + 1))
    router.push(`/users?${params.toString()}`)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pageSize', event.target.value)
    params.set('page', '1')
    router.push(`/users?${params.toString()}`)
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchTerm(value)
    
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`/users?${params.toString()}`)
  }

  const handleEdit = (userId: string) => {
    router.push(`/users/${userId}/edit`)
  }

  const handleDelete = async (userId: string) => {
    if (confirm('确定要删除这个用户吗？')) {
      const formData = new FormData()
      formData.append('id', userId)
      const result = await deleteUser(formData)
      
      if (result.success) {
        // 刷新当前页面
        router.refresh()
      } else {
        alert(result.error)
      }
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="搜索用户"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          fullWidth
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>用户名</TableCell>
              <TableCell>邮箱</TableCell>
              <TableCell>角色</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles.map(({ role }) => (
                    <Chip
                      key={role.id}
                      label={role.name}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(user.id)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(user.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="每页行数"
        />
      </TableContainer>
    </Box>
  )
} 