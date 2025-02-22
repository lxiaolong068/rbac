import { PrismaClient } from '@prisma/client'
import logger from './logger'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// 为避免类型错误，将事件名称和事件参数均设为 any
prisma.$on('query' as any, (e: any) => {
  logger.debug('Query: ' + e.query)
  logger.debug('Params: ' + e.params)
  logger.debug('Duration: ' + e.duration + 'ms')
})

prisma.$on('error' as any, (e: any) => {
  logger.error('Database error: ' + e.message)
})

prisma.$on('info' as any, (e: any) => {
  logger.info('Database info: ' + e.message)
})

prisma.$on('warn' as any, (e: any) => {
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