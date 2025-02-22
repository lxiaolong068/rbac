import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

interface JWTPayload {
  sub: string
  roles?: string[]
  [key: string]: any
}

export async function signAccessToken(payload: JWTPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .setIssuedAt()
    .sign(secret)

  cookies().set('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600 // 1小时
  })

  return token
}

export async function signRefreshToken(payload: JWTPayload) {
  const token = await new SignJWT({
    sub: payload.sub
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(secret)

  cookies().set('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600 // 30天
  })

  return token
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    // 验证刷新令牌
    const payload = await verifyToken(refreshToken)
    
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    // 生成新的令牌对
    const [accessToken, newRefreshToken] = await Promise.all([
      signAccessToken({
        sub: user.id,
        roles: user.roles.map(r => r.role.name)
      }),
      signRefreshToken({
        sub: user.id
      })
    ])
    
    return {
      accessToken,
      refreshToken: newRefreshToken
    }
  } catch (error) {
    throw new Error('Invalid refresh token')
  }
} 