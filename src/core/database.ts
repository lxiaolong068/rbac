import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from './config';
import { logger } from './logger';

const execAsync = promisify(exec);

export class DatabaseManager {
  private static prisma: PrismaClient;

  static async initialize() {
    try {
      logger.info('初始化数据库...');
      
      // 运行迁移
      await this.runMigrations();
      
      // 初始化 Prisma 客户端
      await this.initializePrisma();
      
      // 初始化基础数据
      await this.seedData();
      
      logger.info('数据库初始化完成');
    } catch (error) {
      logger.error('数据库初始化失败:', error);
      throw error;
    }
  }

  static async runMigrations() {
    try {
      logger.info('运行数据库迁移...');
      await execAsync('pnpm prisma migrate deploy');
      logger.info('数据库迁移完成');
    } catch (error) {
      logger.error('数据库迁移失败:', error);
      throw error;
    }
  }

  private static async initializePrisma() {
    try {
      logger.info('初始化 Prisma 客户端...');
      
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: config.database.url,
          },
        },
        log: config.app.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      // 添加中间件用于性能监控
      if (config.monitoring.enabled) {
        this.prisma.$use(async (params, next) => {
          const start = Date.now();
          const result = await next(params);
          const end = Date.now();
          
          logger.debug('数据库查询性能', {
            model: params.model,
            action: params.action,
            duration: end - start,
          });
          
          return result;
        });
      }

      await this.prisma.$connect();
      logger.info('Prisma 客户端初始化完成');
    } catch (error) {
      logger.error('Prisma 客户端初始化失败:', error);
      throw error;
    }
  }

  private static async seedData() {
    try {
      logger.info('填充基础数据...');
      
      // 清理现有数据
      await this.cleanData();
      
      // 创建基础权限
      const permissions = await this.createBasePermissions();
      
      // 创建管理员角色
      const adminRole = await this.createAdminRole(permissions);
      
      // 创建管理员用户
      await this.createAdminUser(adminRole.id);
      
      logger.info('基础数据填充完成');
    } catch (error) {
      logger.error('基础数据填充失败:', error);
      throw error;
    }
  }

  private static async cleanData() {
    const tables = ['rolePermission', 'userRole', 'permission', 'role', 'user'];
    for (const table of tables) {
      await this.prisma[table].deleteMany();
    }
  }

  private static async createBasePermissions() {
    const permissionData = [
      { name: 'View Users', description: '查看用户列表', resource: 'user', action: 'read' },
      { name: 'Manage Users', description: '管理用户', resource: 'user', action: 'write' },
      { name: 'View Roles', description: '查看角色列表', resource: 'role', action: 'read' },
      { name: 'Manage Roles', description: '管理角色', resource: 'role', action: 'write' },
      { name: 'View Permissions', description: '查看权限列表', resource: 'permission', action: 'read' },
      { name: 'Manage Permissions', description: '管理权限', resource: 'permission', action: 'write' },
    ];

    return await Promise.all(
      permissionData.map(data => 
        this.prisma.permission.create({ data })
      )
    );
  }

  private static async createAdminRole(permissions: any[]) {
    return await this.prisma.role.create({
      data: {
        name: 'admin',
        description: '系统管理员',
        rolePermissions: {
          create: permissions.map(p => ({ permissionId: p.id }))
        }
      }
    });
  }

  private static async createAdminUser(roleId: string) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', config.auth.bcrypt.saltRounds);
    
    return await this.prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        userRoles: {
          create: {
            roleId: roleId,
          },
        },
      },
    });
  }

  static async disconnect() {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }

  static get client() {
    if (!this.prisma) {
      throw new Error('数据库客户端未初始化');
    }
    return this.prisma;
  }

  // 事务处理
  static async transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(fn);
  }
} 