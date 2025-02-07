import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { createAPILogger } from '@/lib/logger'
import prisma from '@/lib/prisma'
import { markInitComplete } from '@/lib/init'

const logger = createAPILogger('setup/create-admin')

export async function POST(request: Request) {
  try {
    const { adminUsername, adminPassword, adminEmail } = await request.json()

    // 验证输入
    if (!adminUsername || !adminPassword || !adminEmail) {
      return NextResponse.json({
        success: false,
        message: '请填写所有必填字段',
      })
    }

    // 检查是否已存在管理员角色
    const adminRole = await prisma.role.findFirst({
      where: {
        name: 'ADMIN',
      },
      include: {
        users: true,
      },
    })

    if (adminRole && adminRole.users.length > 0) {
      return NextResponse.json({
        success: false,
        message: '管理员账户已存在',
      })
    }

    // 创建或获取管理员角色
    const role = adminRole || await prisma.role.create({
      data: {
        name: 'ADMIN',
        description: '系统管理员',
        isSystem: true,
        priority: 0,
      },
    })

    // 创建管理员账户
    const hashedPassword = await hash(adminPassword, 12)
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminUsername,
        status: true,
        isVerified: true,
        roles: {
          connect: {
            id: role.id,
          },
        },
      },
    })

    // 标记初始化完成
    markInitComplete()

    return NextResponse.json({
      success: true,
      message: '管理员账户创建成功',
    })
  } catch (error) {
    logger.error({ error }, 'Failed to create admin account')
    return NextResponse.json({
      success: false,
      message: '管理员账户创建失败',
    })
  }
} 