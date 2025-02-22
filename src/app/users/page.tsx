import { Suspense } from 'react'
import { Container, Typography, Box } from '@mui/material'
import prisma from '@/lib/prisma'
import UserList from '@/components/users/UserList'
import UserListSkeleton from '@/components/users/UserListSkeleton'
import CreateUserButton from '@/components/users/CreateUserButton'

// 获取用户列表的服务器组件
async function UserListServer({
  page = 1,
  pageSize = 10,
  search = '',
}: {
  page?: number
  pageSize?: number
  search?: string
}) {
  const where = search ? {
    OR: [
      { username: { contains: search } },
      { email: { contains: search } }
    ]
  } : {}

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        roles: {
          include: {
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  ])

  return (
    <UserList
      users={users}
      total={total}
      page={page}
      pageSize={pageSize}
    />
  )
}

// 用户管理页面
export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ''

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            用户管理
          </Typography>
          <CreateUserButton />
        </Box>

        <Suspense fallback={<UserListSkeleton />}>
          <UserListServer page={page} search={search} />
        </Suspense>
      </Box>
    </Container>
  )
} 