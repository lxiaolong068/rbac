import { NextResponse } from 'next/server'
import { createAPILogger } from '@/lib/logger'
import { PrismaClient } from '@prisma/client'

const logger = createAPILogger('setup/check-database')

export async function POST(request: Request) {
  try {
    const { dbUrl } = await request.json()
    
    if (!dbUrl) {
      return NextResponse.json({
        success: false,
        message: '请提供数据库连接URL',
      })
    }

    // 创建新的Prisma客户端实例用于测试连接
    const testClient = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    })

    try {
      // 测试数据库连接
      await testClient.$connect()
      
      // 检查数据库表是否已创建
      const tables = await testClient.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `
      
      await testClient.$disconnect()

      if (!Array.isArray(tables) || tables.length === 0) {
        return NextResponse.json({
          success: false,
          message: '数据库表未创建，请先运行数据库迁移',
        })
      }

      return NextResponse.json({
        success: true,
        message: '数据库连接正常',
      })
    } catch (error) {
      await testClient.$disconnect()
      throw error
    }
  } catch (error) {
    logger.error('Database check failed:', error)
    return NextResponse.json({
      success: false,
      message: '数据库连接失败，请检查配置',
    })
  }
} 