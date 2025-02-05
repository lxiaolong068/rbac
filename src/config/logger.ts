import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';

const logDir = process.env.LOG_DIR || 'logs';
const logLevel = process.env.LOG_LEVEL || 'info';
const maxSize = process.env.LOG_MAX_SIZE || '10m';
const maxFiles = process.env.LOG_MAX_FILES || '5';

// 创建日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 创建日志轮转传输
const dailyRotateTransport = new DailyRotateFile({
  filename: join(logDir, '%DATE%-app.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize,
  maxFiles,
  level: logLevel,
});

// 创建错误日志轮转传输
const errorRotateTransport = new DailyRotateFile({
  filename: join(logDir, '%DATE%-error.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize,
  maxFiles,
  level: 'error',
});

// 创建日志记录器
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    dailyRotateTransport,
    errorRotateTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default logger; 