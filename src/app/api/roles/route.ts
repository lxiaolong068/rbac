import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

// 获取角色列表
export async function GET(request: NextRequest) {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    // 格式化角色数据
    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      permissions: role.permissions.map(rp => rp.permission)
    }))

    return NextResponse.json(formattedRoles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// 创建新角色
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, permissions } = body

    // 检查必填字段
    if (!name) {
      return new NextResponse(
        JSON.stringify({ message: 'Role name is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 检查角色名是否已存在
    const existingRole = await prisma.role.findUnique({
      where: { name }
    })

    if (existingRole) {
      return new NextResponse(
        JSON.stringify({ message: 'Role name already exists' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 创建角色
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissions?.map((permissionId: string) => ({
            permission: {
              connect: { id: permissionId }
            }
          })) || []
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    // 格式化返回数据
    const formattedRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      permissions: role.permissions.map(rp => rp.permission)
    }

    return new NextResponse(
      JSON.stringify(formattedRole),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error creating role:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 