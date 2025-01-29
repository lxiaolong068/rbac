import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 清理现有数据
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleaned up existing data');

  // 创建基础权限
  const permissions = await Promise.all([
    prisma.permission.create({
      data: {
        name: 'Create User',
        description: 'Can create new users',
        resource: 'user',
        action: 'create'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Read User',
        description: 'Can view user details',
        resource: 'user',
        action: 'read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Update User',
        description: 'Can update user details',
        resource: 'user',
        action: 'update'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Delete User',
        description: 'Can delete users',
        resource: 'user',
        action: 'delete'
      }
    })
  ]);

  console.log('Created base permissions');

  // 创建管理员角色
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'System Administrator'
    }
  });

  // 为管理员角色分配所有权限
  await Promise.all(
    permissions.map(permission =>
      prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      })
    )
  );

  console.log('Created admin role with permissions');

  // 创建管理员用户
  const adminUser = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      username: process.env.ADMIN_USERNAME || 'admin',
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10),
      isActive: true
    }
  });

  // 为管理员用户分配管理员角色
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  console.log('Created admin user with role');

  // 创建普通用户角色
  const userRole = await prisma.role.create({
    data: {
      name: 'User',
      description: 'Regular User'
    }
  });

  // 为普通用户角色分配基本权限
  await prisma.rolePermission.create({
    data: {
      roleId: userRole.id,
      permissionId: permissions[1].id // 只有读取权限
    }
  });

  console.log('Created user role with basic permissions');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 