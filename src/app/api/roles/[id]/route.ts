import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

// 获取角色详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!role) {
      return new NextResponse(
        JSON.stringify({ message: 'Role not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 格式化角色数据
    const formattedRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      permissions: role.permissions.map(rp => rp.permission)
    }

    return NextResponse.json(formattedRole)
  } catch (error) {
    console.error('Error fetching role:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// 更新角色
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, permissions } = body

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id: params.id }
    })

    if (!existingRole) {
      return new NextResponse(
        JSON.stringify({ message: 'Role not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 如果更新名称，检查新名称是否已被使用
    if (name && name !== existingRole.name) {
      const nameExists = await prisma.role.findUnique({
        where: { name }
      })

      if (nameExists) {
        return new NextResponse(
          JSON.stringify({ message: 'Role name already exists' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // 更新角色
    const updatedRole = await prisma.role.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(permissions && {
          permissions: {
            deleteMany: {},
            create: permissions.map((permissionId: string) => ({
              permission: {
                connect: { id: permissionId }
              }
            }))
          }
        })
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
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      createdAt: updatedRole.createdAt,
      permissions: updatedRole.permissions.map(rp => rp.permission)
    }

    return NextResponse.json(formattedRole)
  } catch (error) {
    console.error('Error updating role:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// 删除角色
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 检查角色是否存在
    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        users: true
      }
    })

    if (!role) {
      return new NextResponse(
        JSON.stringify({ message: 'Role not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 检查是否有用户使用此角色
    if (role.users.length > 0) {
      return new NextResponse(
        JSON.stringify({
          message: 'Cannot delete role: it is still assigned to users'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 删除角色
    await prisma.role.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting role:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 