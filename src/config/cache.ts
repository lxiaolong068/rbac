import { CacheConfig } from '@/lib/cache/types';

export function loadCacheConfig(): CacheConfig {
  return {
    driver: (process.env.CACHE_DRIVER as 'memory' | 'redis') || 'memory',
    redis: process.env.REDIS_URL ? {
      url: process.env.REDIS_URL
    } : process.env.REDIS_HOST ? {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    } : undefined,
    prefix: process.env.CACHE_PREFIX || 'rbac:',
    ttl: parseInt(process.env.CACHE_TTL || '3600')
  };
} 