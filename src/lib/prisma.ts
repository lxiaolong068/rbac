import { PrismaClient } from '@prisma/client'
import { createErrorLogger } from './logger'

const logger = createErrorLogger('prisma')

// 在开发环境中保持prisma客户端的热重载
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
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

// 日志事件监听
prisma.$on('query', (e) => {
  logger.debug(e, 'Prisma Query')
})

prisma.$on('error', (e) => {
  logger.error(e, 'Prisma Error')
})

prisma.$on('info', (e) => {
  logger.info(e, 'Prisma Info')
})

prisma.$on('warn', (e) => {
  logger.warn(e, 'Prisma Warning')
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma 