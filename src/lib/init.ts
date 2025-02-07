import fs from 'fs';
import path from 'path';
import { createErrorLogger } from './logger';

const logger = createErrorLogger('initialization');
const INIT_FILE = '.init';

export function getInitFilePath() {
  return path.join(process.cwd(), INIT_FILE);
}

export function isInitRequired(): boolean {
  try {
    const initFilePath = getInitFilePath();
    const exists = fs.existsSync(initFilePath);
    logger.info(`Checking init file at ${initFilePath}: ${exists ? 'exists' : 'does not exist'}`);
    // 如果 .init 文件存在，说明需要初始化
    return exists;
  } catch (error) {
    logger.error('Error checking init file:', error);
    // 如果出现错误，返回 true 以确保安全
    return true;
  }
}

export function markInitComplete() {
  try {
    const initFilePath = getInitFilePath();
    logger.info(`Attempting to remove init file at ${initFilePath}`);
    if (fs.existsSync(initFilePath)) {
      fs.unlinkSync(initFilePath);
      logger.info('Init file removed successfully');
    } else {
      logger.warn('Init file does not exist when trying to remove it');
    }
  } catch (error) {
    logger.error('Error removing init file:', error);
    throw new Error('Failed to mark initialization as complete');
  }
}

export function ensureInitFile() {
  try {
    const initFilePath = getInitFilePath();
    logger.info(`Ensuring init file exists at ${initFilePath}`);
    if (!fs.existsSync(initFilePath)) {
      fs.writeFileSync(initFilePath, '');
      logger.info('Created new init file');
    } else {
      logger.info('Init file already exists');
    }
  } catch (error) {
    logger.error('Error creating init file:', error);
    throw new Error('Failed to create init file');
  }
} 