'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

// 创建用户的验证 schema
const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  roleIds: z.array(z.string()).optional(),
})

// 更新用户的验证 schema
const updateUserSchema = z.object({
  id: z.string(),
  username: z.string().min(3).max(20).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  roleIds: z.array(z.string()).optional(),
})

// 创建用户
export async function createUser(formData: FormData) {
  try {
    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      roleIds: formData.getAll('roleIds'),
    }

    // 验证数据
    const validated = createUserSchema.parse(data)

    // 加密密码
    const hashedPassword = await hash(validated.password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: validated.username,
        email: validated.email,
        password: hashedPassword,
        roles: {
          create: validated.roleIds?.map(roleId => ({
            role: {
              connect: { id: roleId }
            }
          })) || []
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    // 重新验证用户列表页面
    revalidatePath('/users')

    return { success: true, user }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: '验证失败', details: error.errors }
    }
    return { success: false, error: '创建用户失败' }
  }
}

// 更新用户
export async function updateUser(formData: FormData) {
  try {
    const data = {
      id: formData.get('id'),
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      roleIds: formData.getAll('roleIds'),
    }

    // 验证数据
    const validated = updateUserSchema.parse(data)

    // 准备更新数据
    const updateData: any = {
      username: validated.username,
      email: validated.email,
    }

    // 如果提供了新密码，则更新密码
    if (validated.password) {
      updateData.password = await hash(validated.password, 10)
    }

    // 更新用户
    const user = await prisma.user.update({
      where: { id: validated.id },
      data: {
        ...updateData,
        roles: {
          deleteMany: {},
          create: validated.roleIds?.map(roleId => ({
            role: {
              connect: { id: roleId }
            }
          })) || []
        }
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    // 重新验证用户列表和详情页面
    revalidatePath('/users')
    revalidatePath(`/users/${user.id}`)

    return { success: true, user }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: '验证失败', details: error.errors }
    }
    return { success: false, error: '更新用户失败' }
  }
}

// 删除用户
export async function deleteUser(formData: FormData) {
  try {
    const userId = formData.get('id')
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID')
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    // 重新验证用户列表页面
    revalidatePath('/users')

    return { success: true }
  } catch (error) {
    return { success: false, error: '删除用户失败' }
  }
} 