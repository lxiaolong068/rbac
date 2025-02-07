import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

// 获取权限详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        resource: true,
        action: true,
        createdAt: true,
        rolePerms: {
          select: {
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!permission) {
      return new NextResponse(
        JSON.stringify({ message: 'Permission not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 转换响应格式
    const formattedPermission = {
      ...permission,
      roles: permission.rolePerms.map(rp => rp.role)
    }

    return NextResponse.json(formattedPermission)
  } catch (error) {
    console.error('Error fetching permission:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// 更新权限
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, resource, action } = body

    // 检查权限是否存在
    const existingPermission = await prisma.permission.findUnique({
      where: { id: params.id }
    })

    if (!existingPermission) {
      return new NextResponse(
        JSON.stringify({ message: 'Permission not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 如果更新了唯一字段，检查是否与其他权限冲突
    if (
      (name && name !== existingPermission.name) ||
      (resource && action && 
        (resource !== existingPermission.resource || 
         action !== existingPermission.action))
    ) {
      const conflictingPermission = await prisma.permission.findFirst({
        where: {
          id: { not: params.id },
          OR: [
            { name },
            {
              AND: [
                { resource: resource || existingPermission.resource },
                { action: action || existingPermission.action }
              ]
            }
          ]
        }
      })

      if (conflictingPermission) {
        return new NextResponse(
          JSON.stringify({ 
            message: conflictingPermission.name === name
              ? 'Permission name already exists'
              : 'Permission with this resource and action already exists'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // 更新权限
    const permission = await prisma.permission.update({
      where: { id: params.id },
      data: {
        name,
        description,
        resource,
        action
      },
      select: {
        id: true,
        name: true,
        description: true,
        resource: true,
        action: true,
        createdAt: true,
        rolePerms: {
          select: {
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // 转换响应格式
    const formattedPermission = {
      ...permission,
      roles: permission.rolePerms.map(rp => rp.role)
    }

    return NextResponse.json(formattedPermission)
  } catch (error) {
    console.error('Error updating permission:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// 删除权限
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 检查权限是否存在
    const permission = await prisma.permission.findUnique({
      where: { id: params.id },
      include: {
        rolePerms: {
          select: {
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!permission) {
      return new NextResponse(
        JSON.stringify({ message: 'Permission not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 检查权限是否被角色使用
    if (permission.rolePerms.length > 0) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Cannot delete permission as it is being used by roles',
          roles: permission.rolePerms.map(rp => rp.role.name)
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 删除权限
    await prisma.permission.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting permission:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 