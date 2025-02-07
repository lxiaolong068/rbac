import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

// 获取权限列表
export async function GET(request: NextRequest) {
  try {
    const permissions = await prisma.permission.findMany({
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
    const formattedPermissions = permissions.map(permission => ({
      ...permission,
      roles: permission.rolePerms.map(rp => rp.role)
    }))

    return NextResponse.json(formattedPermissions)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// 创建新权限
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, resource, action } = body

    // 检查必填字段
    if (!name || !resource || !action) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Permission name, resource and action are required' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 检查权限名是否已存在
    const existingPermission = await prisma.permission.findFirst({
      where: {
        OR: [
          { name },
          { 
            AND: [
              { resource },
              { action }
            ]
          }
        ]
      }
    })

    if (existingPermission) {
      return new NextResponse(
        JSON.stringify({ 
          message: existingPermission.name === name 
            ? 'Permission name already exists'
            : 'Permission with this resource and action already exists'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 创建权限
    const permission = await prisma.permission.create({
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
        createdAt: true
      }
    })

    return new NextResponse(
      JSON.stringify(permission),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error creating permission:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 