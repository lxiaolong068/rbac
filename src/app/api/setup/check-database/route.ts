import { NextResponse } from 'next/server'
import { createAPILogger } from '@/lib/logger'
import prisma from '@/lib/prisma'

const logger = createAPILogger('setup/check-database')

export async function GET() {
  try {
    // 测试数据库连接
    await prisma.$connect()
    
    // 检查数据库表是否已创建
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `
    
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
    logger.error({ error }, 'Database check failed')
    return NextResponse.json({
      success: false,
      message: '数据库连接失败，请检查配置',
    })
  } finally {
    await prisma.$disconnect()
  }
} 