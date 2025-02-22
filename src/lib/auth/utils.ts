import { auth } from '@/auth'
import { type Permission } from '@prisma/client'

/**
 * 检查用户是否有指定的权限
 */
export async function checkPermission(
  permissionCode: string,
  options: { throwError?: boolean } = {}
): Promise<boolean> {
  const session = await auth()
  if (!session?.user) {
    if (options.throwError) {
      throw new Error('未登录')
    }
    return false
  }

  const hasPermission = session.user.roles.some((role) =>
    role.permissions.some((permission) => permission.code === permissionCode)
  )

  if (!hasPermission && options.throwError) {
    throw new Error('没有权限')
  }

  return hasPermission
}

/**
 * 检查用户是否有指定的权限（资源+操作）
 */
export async function checkResourcePermission(
  resource: string,
  action: string,
  options: { throwError?: boolean } = {}
): Promise<boolean> {
  const session = await auth()
  if (!session?.user) {
    if (options.throwError) {
      throw new Error('未登录')
    }
    return false
  }

  const hasPermission = session.user.roles.some((role) =>
    role.permissions.some(
      (permission) =>
        permission.resource === resource && permission.action === action
    )
  )

  if (!hasPermission && options.throwError) {
    throw new Error('没有权限')
  }

  return hasPermission
}

/**
 * 获取用户的所有权限
 */
export async function getUserPermissions(): Promise<Permission[]> {
  const session = await auth()
  if (!session?.user) {
    return []
  }

  const permissions = new Set<string>()
  session.user.roles.forEach((role) => {
    role.permissions.forEach((permission) => {
      permissions.add(permission.code)
    })
  })

  return Array.from(permissions).map((code) => ({
    code,
    resource: code.split(':')[0],
    action: code.split(':')[1],
  })) as Permission[]
}

/**
 * 检查用户是否是超级管理员
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth()
  if (!session?.user) {
    return false
  }

  return session.user.roles.some((role) => role.name === 'admin')
} 