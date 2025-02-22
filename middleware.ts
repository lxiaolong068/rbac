'use strict'

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 定义不需要认证的公开路径
const publicPaths = ['/auth/login', '/auth/error'];

export async function middleware(request: NextRequest) {
  // 直接从请求的 cookie 中获取会话 token
  const sessionToken = request.cookies.get('next-auth.session-token') || request.cookies.get('next-auth.csrf-token');

  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // 如果是公开路径且存在会话 token，则重定向到首页
  if (isPublicPath && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 如果不是公开路径且不存在会话 token，则重定向到登录页
  if (!isPublicPath && !sessionToken) {
    const searchParams = new URLSearchParams({ callbackUrl: request.url });
    return NextResponse.redirect(new URL(`/auth/login?${searchParams.toString()}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|images).*)'],
  runtime: 'nodejs',
}; 