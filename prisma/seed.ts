import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // 创建超级管理员角色
    const adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        description: '超级管理员',
        isSystem: true,
        priority: 0,
      },
    });

    // 创建基础权限
    const permissions = await Promise.all([
      // 用户管理权限
      prisma.permission.create({
        data: {
          name: '查看用户',
          code: 'user:read',
          type: 'API',
          resource: 'user',
          action: 'read',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: '创建用户',
          code: 'user:create',
          type: 'API',
          resource: 'user',
          action: 'create',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: '更新用户',
          code: 'user:update',
          type: 'API',
          resource: 'user',
          action: 'update',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: '删除用户',
          code: 'user:delete',
          type: 'API',
          resource: 'user',
          action: 'delete',
          isSystem: true,
        },
      }),

      // 角色管理权限
      prisma.permission.create({
        data: {
          name: '查看角色',
          code: 'role:read',
          type: 'API',
          resource: 'role',
          action: 'read',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: '创建角色',
          code: 'role:create',
          type: 'API',
          resource: 'role',
          action: 'create',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: '更新角色',
          code: 'role:update',
          type: 'API',
          resource: 'role',
          action: 'update',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: '删除角色',
          code: 'role:delete',
          type: 'API',
          resource: 'role',
          action: 'delete',
          isSystem: true,
        },
      }),

      // 权限管理权限
      prisma.permission.create({
        data: {
          name: '查看权限',
          code: 'permission:read',
          type: 'API',
          resource: 'permission',
          action: 'read',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: '分配权限',
          code: 'permission:assign',
          type: 'API',
          resource: 'permission',
          action: 'assign',
          isSystem: true,
        },
      }),
    ]);

    // 为超级管理员角色分配所有权限
    await Promise.all(
      permissions.map((permission) =>
        prisma.rolePermission.create({
          data: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        })
      )
    );

    // 创建超级管理员用户
    const adminPassword = await hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: adminPassword,
        name: '超级管理员',
        status: true,
      },
    });

    // 为超级管理员用户分配超级管理员角色
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    // 创建基础菜单
    const dashboardMenu = await prisma.menu.create({
      data: {
        name: '仪表盘',
        path: '/dashboard',
        icon: 'dashboard',
        order: 1,
        isVisible: true,
      },
    });

    const systemMenu = await prisma.menu.create({
      data: {
        name: '系统管理',
        icon: 'settings',
        order: 100,
        isVisible: true,
      },
    });

    await Promise.all([
      prisma.menu.create({
        data: {
          name: '用户管理',
          path: '/system/users',
          icon: 'user',
          parent: {
            connect: {
              id: systemMenu.id,
            },
          },
          order: 1,
          isVisible: true,
        },
      }),
      prisma.menu.create({
        data: {
          name: '角色管理',
          path: '/system/roles',
          icon: 'role',
          parent: {
            connect: {
              id: systemMenu.id,
            },
          },
          order: 2,
          isVisible: true,
        },
      }),
      prisma.menu.create({
        data: {
          name: '权限管理',
          path: '/system/permissions',
          icon: 'permission',
          parent: {
            connect: {
              id: systemMenu.id,
            },
          },
          order: 3,
          isVisible: true,
        },
      }),
    ]);

    // 创建系统配置
    await prisma.systemConfig.create({
      data: {
        key: 'system_initialized',
        value: { initialized: true, timestamp: new Date().toISOString() },
      },
    });

    console.log('Database has been seeded. 🌱');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
