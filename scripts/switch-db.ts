import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCHEMA_DIR = path.join(process.cwd(), 'prisma');
const DEFAULT_SCHEMA = path.join(SCHEMA_DIR, 'schema.prisma');

interface DbConfig {
  provider: string;
  schemaPath: string;
}

const DB_CONFIGS: Record<string, DbConfig> = {
  mysql: {
    provider: 'mysql',
    schemaPath: DEFAULT_SCHEMA,
  },
  postgresql: {
    provider: 'postgresql',
    schemaPath: path.join(SCHEMA_DIR, 'schema.postgresql.prisma'),
  },
};

function switchDatabase(dbType: string) {
  const config = DB_CONFIGS[dbType];
  if (!config) {
    console.error(`Unsupported database type: ${dbType}`);
    console.error('Supported types:', Object.keys(DB_CONFIGS).join(', '));
    process.exit(1);
  }

  // 备份当前的 schema 文件
  const backupPath = `${DEFAULT_SCHEMA}.backup`;
  if (fs.existsSync(DEFAULT_SCHEMA)) {
    fs.copyFileSync(DEFAULT_SCHEMA, backupPath);
  }

  try {
    // 复制目标数据库的 schema 文件
    fs.copyFileSync(config.schemaPath, DEFAULT_SCHEMA);
    console.log(`Switched to ${dbType} schema`);

    // 生成 Prisma 客户端
    execSync('pnpm prisma generate', { stdio: 'inherit' });
    console.log('Generated Prisma Client');

    // 运行数据库迁移
    execSync('pnpm prisma migrate deploy', { stdio: 'inherit' });
    console.log('Applied database migrations');

  } catch (error) {
    // 如果出错，恢复备份
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, DEFAULT_SCHEMA);
      console.error('Error occurred, restored previous schema');
    }
    throw error;
  } finally {
    // 清理备份文件
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
  }
}

// 从命令行参数获取数据库类型
const dbType = process.argv[2]?.toLowerCase();
if (!dbType) {
  console.error('Please specify database type');
  console.error('Usage: pnpm run db:switch <mysql|postgresql>');
  process.exit(1);
}

switchDatabase(dbType); 