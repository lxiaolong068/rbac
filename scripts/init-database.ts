import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function initDatabase() {
  try {
    // 1. 检查环境变量
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL 环境变量未设置');
    }

    // 2. 检查数据库类型
    const isDatabaseTypeValid = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('mysql://');
    if (!isDatabaseTypeValid) {
      throw new Error('DATABASE_URL 必须以 postgresql:// 或 mysql:// 开头');
    }

    // 3. 生成 Prisma 客户端
    console.log('正在生成 Prisma 客户端...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 4. 创建迁移文件
    console.log('正在创建迁移文件...');
    execSync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql', { stdio: 'inherit' });

    // 5. 运行数据库迁移
    console.log('正在运行数据库迁移...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // 6. 初始化基础数据
    console.log('正在初始化基础数据...');
    const seedScript = path.join(__dirname, 'seed.ts');
    if (fs.existsSync(seedScript)) {
      execSync('node --loader ts-node/esm ./scripts/seed.ts', { stdio: 'inherit' });
    }

    // 7. 清理迁移文件
    if (fs.existsSync('migration.sql')) {
      fs.unlinkSync('migration.sql');
    }

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

initDatabase(); 