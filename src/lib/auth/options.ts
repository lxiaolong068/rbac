import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signAccessToken, signRefreshToken } from './jwt'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24小时
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
          include: {
            roles: {
              include: {
                role: true
              }
            }
          }
        })

        if (!user || !await compare(credentials.password, user.password)) {
          return null
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles.map(r => r.role)
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.roles = user.roles
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.roles = token.roles
      }
      return session
    },
    async signIn({ user }) {
      if (user) {
        // 生成访问令牌和刷新令牌
        await Promise.all([
          signAccessToken({
            sub: user.id,
            roles: user.roles?.map(role => role.name)
          }),
          signRefreshToken({
            sub: user.id
          })
        ])
      }
      return true
    }
  },
  events: {
    async signOut() {
      // 清除令牌
      const cookieStore = cookies()
      cookieStore.delete('access_token')
      cookieStore.delete('refresh_token')
    }
  }
} 