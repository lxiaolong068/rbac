import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/prisma'

// 扩展 Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        username: string
        email: string
      }
    }
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 从请求头中获取 token
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      username: string
      email: string
    }

    // 检查用户是否存在且处于激活状态
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' })
    }

    // 将用户信息添加到请求对象
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    next(error)
  }
}

// 检查用户是否具有特定权限
export const checkPermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' })
      }

      // 获取用户的所有角色及其权限
      const userRoles = await prisma.userRole.findMany({
        where: { userId: req.user.id },
        include: {
          role: {
            include: {
              rolePerms: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      })

      // 检查用户是否具有所需权限
      const hasPermission = userRoles.some(ur =>
        ur.role.rolePerms.some(rp =>
          rp.permission.resource === resource &&
          rp.permission.action === action
        )
      )

      if (!hasPermission) {
        return res.status(403).json({
          message: `You don't have permission to ${action} ${resource}`
        })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export const config = {
  matcher: '/api/:path*',
} 