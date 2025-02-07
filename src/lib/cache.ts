import { NextResponse } from 'next/server';
import { createErrorLogger } from './logger';

const logger = createErrorLogger('cache');

interface CacheConfig {
  duration: number; // 缓存持续时间（秒）
  tags?: string[]; // 缓存标签，用于批量清除
}

interface CacheEntry {
  data: any;
  expiry: number;
  tags: string[];
}

// 内存缓存存储
const cacheStore = new Map<string, CacheEntry>();

// 生成缓存键
export function generateCacheKey(path: string, params?: Record<string, any>): string {
  if (!params) return path;
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${path}?${sortedParams}`;
}

// 设置缓存
export function setCache(key: string, data: any, config: CacheConfig): void {
  try {
    const entry: CacheEntry = {
      data,
      expiry: Date.now() + config.duration * 1000,
      tags: config.tags || [],
    };
    cacheStore.set(key, entry);
    logger.debug({ key, tags: config.tags }, 'Cache set');
  } catch (error) {
    logger.error({ error, key }, 'Failed to set cache');
  }
}

// 获取缓存
export function getCache(key: string): any {
  try {
    const entry = cacheStore.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      cacheStore.delete(key);
      logger.debug({ key }, 'Cache expired');
      return null;
    }

    logger.debug({ key }, 'Cache hit');
    return entry.data;
  } catch (error) {
    logger.error({ error, key }, 'Failed to get cache');
    return null;
  }
}

// 清除指定标签的缓存
export function invalidateByTags(tags: string[]): void {
  try {
    for (const [key, entry] of cacheStore.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        cacheStore.delete(key);
        logger.debug({ key, tags }, 'Cache invalidated by tags');
      }
    }
  } catch (error) {
    logger.error({ error, tags }, 'Failed to invalidate cache by tags');
  }
}

// 清除指定键的缓存
export function invalidateByKey(key: string): void {
  try {
    cacheStore.delete(key);
    logger.debug({ key }, 'Cache invalidated by key');
  } catch (error) {
    logger.error({ error, key }, 'Failed to invalidate cache by key');
  }
}

// API路由缓存装饰器
export function withCache(config: CacheConfig) {
  return async function(handler: Function) {
    return async function(...args: any[]) {
      const [req] = args;
      const cacheKey = generateCacheKey(req.url);
      
      // 尝试获取缓存
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }

      // 执行原始处理器
      const response = await handler(...args);
      const data = await response.json();

      // 设置缓存
      setCache(cacheKey, data, config);

      return NextResponse.json(data);
    };
  };
}

// 服务端组件缓存Hook
export async function useServerCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig
): Promise<T> {
  try {
    // 尝试获取缓存
    const cachedData = getCache(key);
    if (cachedData) {
      return cachedData;
    }

    // 执行数据获取
    const data = await fetcher();

    // 设置缓存
    setCache(key, data, config);

    return data;
  } catch (error) {
    logger.error({ error, key }, 'Failed to use server cache');
    throw error;
  }
} 