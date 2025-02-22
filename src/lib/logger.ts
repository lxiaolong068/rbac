'use strict'

const logger = {
  debug: (...args: any[]) => console.debug(...args),
  error: (...args: any[]) => console.error(...args),
  info: (...args: any[]) => console.info(...args),
  warn: (...args: any[]) => console.warn(...args)
};

export function createErrorLogger(context: string) {
  return {
    error: (...args: any[]) => logger.error(`[${context}]`, ...args),
    warn: (...args: any[]) => logger.warn(`[${context}]`, ...args),
    info: (...args: any[]) => logger.info(`[${context}]`, ...args),
    debug: (...args: any[]) => logger.debug(`[${context}]`, ...args)
  };
}

export function createAPILogger(context: string) {
  return {
    error: (...args: any[]) => logger.error(`[API:${context}]`, ...args),
    warn: (...args: any[]) => logger.warn(`[API:${context}]`, ...args),
    info: (...args: any[]) => logger.info(`[API:${context}]`, ...args),
    debug: (...args: any[]) => logger.debug(`[API:${context}]`, ...args),
    request: (method: string, path: string, ...args: any[]) => 
      logger.info(`[API:${context}] ${method} ${path}`, ...args),
    response: (status: number, path: string, ...args: any[]) => 
      logger.info(`[API:${context}] ${status} ${path}`, ...args)
  };
}

export default logger; 