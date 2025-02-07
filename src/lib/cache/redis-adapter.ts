import { Redis } from 'ioredis';
import { CacheAdapter, CacheOptions, CacheConfig } from './types';

export class RedisCacheAdapter implements CacheAdapter {
  private client: Redis;
  private defaultTTL: number;
  private prefix: string;

  constructor(config: CacheConfig) {
    const { redis, ttl, prefix } = config;
    
    if (redis?.url) {
      this.client = new Redis(redis.url);
    } else {
      this.client = new Redis({
        host: redis?.host || 'localhost',
        port: redis?.port || 6379,
        password: redis?.password,
        db: redis?.db || 0
      });
    }

    this.defaultTTL = ttl || 3600; // 默认1小时
    this.prefix = prefix || '';
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const value = await this.client.get(fullKey);
    
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.getFullKey(key);
    const ttl = options?.ttl || this.defaultTTL;
    
    await this.client.set(
      fullKey,
      JSON.stringify(value),
      'EX',
      ttl
    );
  }

  async del(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    await this.client.del(fullKey);
  }

  async clear(): Promise<void> {
    // 只清除带有前缀的键
    const pattern = this.prefix ? `${this.prefix}*` : '*';
    const keys = await this.client.keys(pattern);
    
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
} 