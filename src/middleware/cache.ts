import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

const cache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export const cacheMiddleware = (duration: number = DEFAULT_CACHE_TIME) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse && Date.now() - cachedResponse.timestamp < duration) {
      logger.debug(`Cache hit for ${key}`);
      return res.json(cachedResponse.data);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      cache.set(key, {
        data: body,
        timestamp: Date.now(),
      });
      return originalJson(body);
    };

    next();
  };
}; 