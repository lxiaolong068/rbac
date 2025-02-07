import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
})

// 日志事件处理
prisma.$on('query', (e) => {
  logger.debug('Query: ' + e.query)
  logger.debug('Params: ' + e.params)
  logger.debug('Duration: ' + e.duration + 'ms')
})

prisma.$on('error', (e) => {
  logger.error('Database error: ' + e.message)
})

prisma.$on('info', (e) => {
  logger.info('Database info: ' + e.message)
})

prisma.$on('warn', (e) => {
  logger.warn('Database warning: ' + e.message)
})

// 优雅关闭
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export default prisma 