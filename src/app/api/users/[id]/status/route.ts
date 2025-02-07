import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return new NextResponse(
        JSON.stringify({ message: 'Invalid status value' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: 'User not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 更新用户状态
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        roles: {
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

    return NextResponse.json({
      ...updatedUser,
      roles: updatedUser.roles.map(ur => ur.role)
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 