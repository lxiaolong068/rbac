import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // 创建基础权限
    const permissions = await Promise.all([
      prisma.permission.create({
        data: {
          name: 'user:read',
          description: '查看用户信息',
          type: 'API',
          resource: 'user',
          action: 'READ',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: 'user:write',
          description: '修改用户信息',
          type: 'API',
          resource: 'user',
          action: 'WRITE',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: 'role:read',
          description: '查看角色信息',
          type: 'API',
          resource: 'role',
          action: 'READ',
          isSystem: true,
        },
      }),
      prisma.permission.create({
        data: {
          name: 'role:write',
          description: '修改角色信息',
          type: 'API',
          resource: 'role',
          action: 'WRITE',
          isSystem: true,
        },
      }),
    ]);

    // 创建管理员角色
    const adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        description: '系统管理员',
        isSystem: true,
        priority: 0,
        permissions: {
          connect: permissions.map(p => ({ id: p.id })),
        },
      },
    });

    // 创建普通用户角色
    const userRole = await prisma.role.create({
      data: {
        name: 'user',
        description: '普通用户',
        isSystem: true,
        priority: 1,
        permissions: {
          connect: [
            { id: permissions[0].id }, // user:read
          ],
        },
      },
    });

    // 创建管理员用户
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: adminPassword,
        name: 'Admin',
        isVerified: true,
        roles: {
          connect: [{ id: adminRole.id }],
        },
      },
    });

    // 创建测试用户
    const userPassword = await hash('user123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: userPassword,
        name: 'Test User',
        isVerified: true,
        roles: {
          connect: [{ id: userRole.id }],
        },
      },
    });

    // 创建基础菜单
    const menus = await Promise.all([
      prisma.menu.create({
        data: {
          name: '仪表板',
          path: '/dashboard',
          icon: 'dashboard',
          order: 1,
        },
      }),
      prisma.menu.create({
        data: {
          name: '用户管理',
          path: '/users',
          icon: 'users',
          order: 2,
        },
      }),
      prisma.menu.create({
        data: {
          name: '角色管理',
          path: '/roles',
          icon: 'roles',
          order: 3,
        },
      }),
      prisma.menu.create({
        data: {
          name: '权限管理',
          path: '/permissions',
          icon: 'permissions',
          order: 4,
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

    console.log('Seed data created successfully');
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
