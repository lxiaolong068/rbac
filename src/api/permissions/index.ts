import { Router } from 'express'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { validateRequest } from '@/middleware/validate'
import { requireAuth } from '@/middleware/auth'

const router = Router()

// 验证 schema
const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required')
})

const updatePermissionSchema = createPermissionSchema.partial()

// 获取权限列表
router.get('/', requireAuth, async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        resource: true,
        action: true,
        createdAt: true,
        rolePerms: {
          select: {
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // 转换响应格式
    const formattedPermissions = permissions.map(permission => ({
      ...permission,
      roles: permission.rolePerms.map(rp => rp.role)
    }))

    res.json(formattedPermissions)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// 创建新权限
router.post(
  '/',
  requireAuth,
  validateRequest(createPermissionSchema),
  async (req, res) => {
    try {
      const { name, description, resource, action } = req.body

      // 检查权限名是否已存在
      const existingPermission = await prisma.permission.findFirst({
        where: {
          OR: [
            { name },
            {
              AND: [
                { resource },
                { action }
              ]
            }
          ]
        }
      })

      if (existingPermission) {
        return res.status(400).json({
          message: existingPermission.name === name
            ? 'Permission name already exists'
            : 'Permission with this resource and action already exists'
        })
      }

      // 创建权限
      const permission = await prisma.permission.create({
        data: {
          name,
          description,
          resource,
          action
        },
        select: {
          id: true,
          name: true,
          description: true,
          resource: true,
          action: true,
          createdAt: true
        }
      })

      res.status(201).json(permission)
    } catch (error) {
      console.error('Error creating permission:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

// 获取权限详情
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        description: true,
        resource: true,
        action: true,
        createdAt: true,
        rolePerms: {
          select: {
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' })
    }

    // 转换响应格式
    const formattedPermission = {
      ...permission,
      roles: permission.rolePerms.map(rp => rp.role)
    }

    res.json(formattedPermission)
  } catch (error) {
    console.error('Error fetching permission:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// 更新权限
router.put(
  '/:id',
  requireAuth,
  validateRequest(updatePermissionSchema),
  async (req, res) => {
    try {
      const { name, description, resource, action } = req.body

      // 检查权限是否存在
      const existingPermission = await prisma.permission.findUnique({
        where: { id: req.params.id }
      })

      if (!existingPermission) {
        return res.status(404).json({ message: 'Permission not found' })
      }

      // 如果更新了唯一字段，检查是否与其他权限冲突
      if (
        (name && name !== existingPermission.name) ||
        (resource && action &&
          (resource !== existingPermission.resource ||
            action !== existingPermission.action))
      ) {
        const conflictingPermission = await prisma.permission.findFirst({
          where: {
            id: { not: req.params.id },
            OR: [
              { name },
              {
                AND: [
                  { resource: resource || existingPermission.resource },
                  { action: action || existingPermission.action }
                ]
              }
            ]
          }
        })

        if (conflictingPermission) {
          return res.status(400).json({
            message: conflictingPermission.name === name
              ? 'Permission name already exists'
              : 'Permission with this resource and action already exists'
          })
        }
      }

      // 更新权限
      const permission = await prisma.permission.update({
        where: { id: req.params.id },
        data: {
          name,
          description,
          resource,
          action
        },
        select: {
          id: true,
          name: true,
          description: true,
          resource: true,
          action: true,
          createdAt: true,
          rolePerms: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })

      // 转换响应格式
      const formattedPermission = {
        ...permission,
        roles: permission.rolePerms.map(rp => rp.role)
      }

      res.json(formattedPermission)
    } catch (error) {
      console.error('Error updating permission:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
)

// 删除权限
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    // 检查权限是否存在
    const permission = await prisma.permission.findUnique({
      where: { id: req.params.id },
      include: {
        rolePerms: {
          select: {
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' })
    }

    // 检查权限是否被角色使用
    if (permission.rolePerms.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete permission as it is being used by roles',
        roles: permission.rolePerms.map(rp => rp.role.name)
      })
    }

    // 删除权限
    await prisma.permission.delete({
      where: { id: req.params.id }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting permission:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router 