import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { prisma } from '../db'

const credentialsSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
})

export const authConfig: NextAuthConfig = {
  // 使用 Prisma 适配器
  adapter: PrismaAdapter(prisma),
  
  // 配置认证提供者
  providers: [
    Credentials({
      async authorize(credentials) {
        // 验证输入
        const parsedCredentials = credentialsSchema.safeParse(credentials)
        if (!parsedCredentials.success) {
          return null
        }

        const { username, password } = parsedCredentials.data

        // 查找用户
        const user = await prisma.user.findUnique({
          where: { username },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })

        if (!user) {
          console.log('用户不存在:', username)
          return null
        }

        // 验证密码
        const isPasswordValid = await compare(password, user.password)
        if (!isPasswordValid) {
          console.log('密码错误:', username)
          return null
        }

        // 更新登录信息
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginCount: { increment: 1 },
          },
        })

        // 记录审计日志
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'login',
            resource: 'auth',
            details: JSON.stringify({
              ip: credentials.ip || 'unknown',
              userAgent: credentials.userAgent || 'unknown',
            }),
          },
        })

        // 返回用户信息
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          roles: user.roles.map((ur) => ({
            id: ur.role.id,
            name: ur.role.name,
            permissions: ur.role.permissions.map((rp) => ({
              id: rp.permission.id,
              code: rp.permission.code,
              resource: rp.permission.resource,
              action: rp.permission.action,
            })),
          })),
        }
      },
    }),
  ],

  // 配置回调函数
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.roles = user.roles
      }

      // 处理会话更新
      if (trigger === 'update' && session) {
        return { ...token, ...session }
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.roles = token.roles as any[]
      }
      return session
    },
  },

  // 配置页面
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  // 配置会话
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24小时
  },

  // 开启调试模式（仅在开发环境）
  debug: process.env.NODE_ENV === 'development',
} 