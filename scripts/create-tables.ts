import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始创建数据库表...');

    // 创建用户表
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL
      );
    `;

    // 创建角色表
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL
      );
    `;

    // 创建权限表
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        resource VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL,
        UNIQUE KEY resource_action (resource, action)
      );
    `;

    // 创建用户角色关联表
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS user_roles (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        roleId VARCHAR(36) NOT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL,
        UNIQUE KEY user_role (userId, roleId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE
      );
    `;

    // 创建角色权限关联表
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id VARCHAR(36) PRIMARY KEY,
        roleId VARCHAR(36) NOT NULL,
        permissionId VARCHAR(36) NOT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL,
        UNIQUE KEY role_permission (roleId, permissionId),
        FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permissionId) REFERENCES permissions(id) ON DELETE CASCADE
      );
    `;

    console.log('数据库表创建完成！');

    // 创建基础权限
    const permissions = [
      {
        name: 'View Users',
        description: '查看用户列表',
        resource: 'user',
        action: 'read'
      },
      {
        name: 'Manage Users',
        description: '管理用户',
        resource: 'user',
        action: 'write'
      },
      {
        name: 'View Roles',
        description: '查看角色列表',
        resource: 'role',
        action: 'read'
      },
      {
        name: 'Manage Roles',
        description: '管理角色',
        resource: 'role',
        action: 'write'
      }
    ];

    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm
      });
    }

    console.log('基础权限创建完成！');

    // 创建管理员角色
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: '系统管理员'
      }
    });

    console.log('管理员角色创建完成！');

    // 为管理员角色分配所有权限
    const allPermissions = await prisma.permission.findMany();
    for (const perm of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: perm.id
          }
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: perm.id
        }
      });
    }

    console.log('管理员权限分配完成！');

    // 创建管理员用户
    const adminUser = await prisma.user.upsert({
      where: { username: process.env.ADMIN_USERNAME || 'admin' },
      update: {},
      create: {
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      }
    });

    // 为管理员用户分配管理员角色
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });

    console.log('管理员用户创建完成！');
    console.log('数据库初始化完成！');

  } catch (error) {
    console.error('初始化过程中出错：', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
