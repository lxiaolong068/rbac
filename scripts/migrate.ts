import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
  try {
    console.log('开始数据库迁移...');

    // 1. 直接部署迁移（不创建新的迁移）
    console.log('部署数据库迁移...');
    await execAsync('pnpm prisma migrate deploy');
    console.log('数据库迁移部署完成');

    // 2. 生成 Prisma 客户端
    console.log('生成 Prisma 客户端...');
    await execAsync('pnpm prisma generate');
    console.log('Prisma 客户端生成完成');

    console.log('数据库迁移完成！');
  } catch (error) {
    console.error('迁移过程中出错：', error);
    process.exit(1);
  }
}

main();
