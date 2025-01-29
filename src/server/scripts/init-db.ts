import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { config } from '../config'

const prisma = new PrismaClient()

async function main() {
  try {
    // 1. 创建管理员角色（如果不存在）
    let adminRole = await prisma.role.findFirst({
      where: {
        name: 'admin',
      },
    })

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: 'admin',
          description: '系统管理员',
        },
      })
      console.log('管理员角色创建成功')
    }

    // 2. 检查是否已存在管理员用户
    const adminExists = await prisma.user.findFirst({
      where: {
        username: 'admin',
      },
    })

    if (!adminExists) {
      // 3. 创建管理员用户并关联角色
      const hashedPassword = await bcrypt.hash('admin123', config.bcrypt.saltRounds)
      const adminUser = await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          email: 'admin@example.com',
          userRoles: {
            create: {
              roleId: adminRole.id,
            },
          },
        },
      })
      console.log('默认管理员账户创建成功')
      console.log('用户名: admin')
      console.log('密码: admin123')
    } else {
      console.log('管理员账户已存在，跳过创建')
    }

    // 4. 创建基础权限
    const basicPermissions = [
      { name: 'user:read', description: '查看用户', resource: 'user', action: 'read' },
      { name: 'user:write', description: '修改用户', resource: 'user', action: 'write' },
      { name: 'role:read', description: '查看角色', resource: 'role', action: 'read' },
      { name: 'role:write', description: '修改角色', resource: 'role', action: 'write' },
      { name: 'permission:read', description: '查看权限', resource: 'permission', action: 'read' },
      { name: 'permission:write', description: '修改权限', resource: 'permission', action: 'write' },
    ]

    for (const perm of basicPermissions) {
      const exists = await prisma.permission.findFirst({
        where: { name: perm.name },
      })

      if (!exists) {
        await prisma.permission.create({
          data: perm,
        })
      }
    }

    // 5. 为管理员角色分配所有权限
    const allPermissions = await prisma.permission.findMany()
    for (const perm of allPermissions) {
      const exists = await prisma.rolePermission.findFirst({
        where: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      })

      if (!exists) {
        await prisma.rolePermission.create({
          data: {
            roleId: adminRole.id,
            permissionId: perm.id,
          },
        })
      }
    }

    console.log('数据库初始化完成')

  } catch (error) {
    console.error('数据库初始化失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main() 