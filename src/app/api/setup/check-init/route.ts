import { NextResponse } from 'next/server'
import { createAPILogger } from '@/lib/logger'
import { isInitRequired } from '@/lib/init'

const logger = createAPILogger('setup/check-init')

export async function GET() {
  try {
    const needsInit = isInitRequired();

    return NextResponse.json({
      initialized: !needsInit,
      message: needsInit ? '系统未初始化' : '系统已初始化'
    })
  } catch (error) {
    logger.error({ error }, 'Failed to check system initialization status')
    return NextResponse.json({
      initialized: false,
      message: '检查系统初始化状态时出错'
    })
  }
} 