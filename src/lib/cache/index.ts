import { CacheAdapter, CacheConfig } from './types';
import { MemoryCacheAdapter } from './memory-adapter';
import { RedisCacheAdapter } from './redis-adapter';

let cacheInstance: CacheAdapter | null = null;

export async function createCacheAdapter(config: CacheConfig): Promise<CacheAdapter> {
  if (cacheInstance) {
    if (config.driver === 'redis' && cacheInstance instanceof RedisCacheAdapter) {
      await (cacheInstance as RedisCacheAdapter).disconnect();
    }
    cacheInstance = null;
  }

  switch (config.driver) {
    case 'redis':
      cacheInstance = new RedisCacheAdapter(config);
      break;
    case 'memory':
    default:
      cacheInstance = new MemoryCacheAdapter({
        ttl: config.ttl,
        prefix: config.prefix
      });
  }

  return cacheInstance;
}

export async function getCacheAdapter(): Promise<CacheAdapter> {
  if (!cacheInstance) {
    // 默认使用内存缓存
    cacheInstance = new MemoryCacheAdapter();
  }
  return cacheInstance;
}

// 导出类型
export * from './types';
export { MemoryCacheAdapter } from './memory-adapter';
export { RedisCacheAdapter } from './redis-adapter'; 