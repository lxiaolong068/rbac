import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'
import { createRequestLogger } from './lib/logger'

// JWT 解码后的数据类型
interface JWTPayload {
  userId: string
  [key: string]: any
}

// 初始化相关的路由
const SETUP_ROUTES = [
  '/setup',
  '/api/setup/check-init',
  '/api/setup/check-env',
  '/api/setup/check-database',
  '/api/setup/create-admin',
  '/_next',
  '/favicon.ico',
  '/static',
]

// 需要认证的路由
const AUTH_ROUTES = [
  '/dashboard',
  '/users',
  '/roles',
  '/permissions',
  '/api/users',
  '/api/roles',
  '/api/permissions'
]

// 公开路由
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
]

export async function middleware(request: NextRequest) {
  const logger = createRequestLogger(request)
  const { pathname } = request.nextUrl

  // 检查是否是初始化相关的路由
  if (SETUP_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // 检查系统初始化状态
  const initCheckResponse = await fetch(new URL('/api/setup/check-init', request.url))
  const initData = await initCheckResponse.json()

  if (!initData.initialized) {
    logger.info('System not initialized, redirecting to setup wizard')
    return NextResponse.redirect(new URL('/setup', request.url))
  }

  // 系统已初始化，处理认证逻辑
  if (AUTH_ROUTES.some(route => pathname.startsWith(route)) || pathname === '/') {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      // API 路由返回 401 状态码
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: '未授权访问' },
          { status: 401 }
        )
      }
      // 页面路由重定向到登录页
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', decoded.userId)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      // API 路由返回 401 状态码
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: '无效的令牌' },
          { status: 401 }
        )
      }
      // 页面路由重定向到登录页
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路由
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
} 