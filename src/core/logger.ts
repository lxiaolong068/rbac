import winston from 'winston';
import { config } from './config';

// 定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  config.logging.format === 'json'
    ? winston.format.json()
    : winston.format.simple()
);

// 创建日志记录器
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// 如果配置了文件路径，添加文件输出
if (config.logging.filePath) {
  logger.add(
    new winston.transports.File({
      filename: config.logging.filePath,
      format: logFormat,
    })
  );
}

// 开发环境下打印更详细的信息
if (config.app.env === 'development') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    })
  );
}

export { logger }; 