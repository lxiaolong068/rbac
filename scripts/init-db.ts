import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('开始初始化数据库...');

    // 1. 运行数据库迁移
    console.log('运行数据库迁移...');
    await execAsync('pnpm prisma migrate deploy');
    console.log('数据库迁移完成');

    // 2. 生成 Prisma 客户端
    console.log('生成 Prisma 客户端...');
    await execAsync('pnpm prisma generate');
    console.log('Prisma 客户端生成完成');

    // 3. 运行种子脚本
    console.log('初始化基础数据...');
    
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

    console.log('权限创建完成');

    // 创建管理员角色
    const adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        description: '系统管理员'
      }
    });

    console.log('管理员角色创建完成');

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

    console.log('角色权限分配完成');

    // 创建管理员用户
    const adminUser = await prisma.user.create({
      data: {
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      }
    });

    // 为管理员用户分配管理员角色
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });

    console.log('管理员用户创建完成');
    console.log('数据库初始化完成！');

  } catch (error) {
    console.error('初始化过程中出错：', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
