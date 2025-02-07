import { NextResponse } from 'next/server'
import { createAPILogger } from '@/lib/logger'

const logger = createAPILogger('setup/check-env')

export async function GET() {
  try {
    // 检查必要的环境变量
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
    ]

    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    )

    if (missingEnvVars.length > 0) {
      return NextResponse.json({
        success: false,
        message: `缺少必要的环境变量: ${missingEnvVars.join(', ')}`,
      })
    }

    // 检查 Node.js 版本
    const nodeVersion = process.version
    const requiredNodeVersion = 'v18.0.0'
    if (nodeVersion < requiredNodeVersion) {
      return NextResponse.json({
        success: false,
        message: `Node.js 版本过低，需要 ${requiredNodeVersion} 或更高版本`,
      })
    }

    return NextResponse.json({
      success: true,
      message: '环境检查通过',
    })
  } catch (error) {
    logger.error({ error }, 'Environment check failed')
    return NextResponse.json({
      success: false,
      message: '环境检查失败',
    })
  }
} 