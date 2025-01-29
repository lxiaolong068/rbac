import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 清理现有数据
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // 创建权限
  const permissions = await Promise.all([
    prisma.permission.create({
      data: {
        name: 'View Users',
        description: '查看用户列表',
        resource: 'user',
        action: 'read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Users',
        description: '管理用户',
        resource: 'user',
        action: 'write'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'View Roles',
        description: '查看角色列表',
        resource: 'role',
        action: 'read'
      }
    }),
    prisma.permission.create({
      data: {
        name: 'Manage Roles',
        description: '管理角色',
        resource: 'role',
        action: 'write'
      }
    })
  ]);

  // 创建角色
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: '系统管理员'
    }
  });

  // 为管理员角色添加所有权限
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

  // 创建管理员用户
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10)
    }
  });

  // 为管理员用户分配管理员角色
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
