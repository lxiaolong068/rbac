import { CacheAdapter, CacheOptions, CacheValue } from './types';

export class MemoryCacheAdapter implements CacheAdapter {
  private cache: Map<string, CacheValue>;
  private defaultTTL: number;
  private prefix: string;

  constructor(options?: CacheOptions) {
    this.cache = new Map();
    this.defaultTTL = options?.ttl || 3600; // 默认1小时
    this.prefix = options?.prefix || '';
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private isExpired(value: CacheValue): boolean {
    return value.expires < Date.now();
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    const value = this.cache.get(fullKey);

    if (!value) {
      return null;
    }

    if (this.isExpired(value)) {
      this.cache.delete(fullKey);
      return null;
    }

    return value.data as T;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.getFullKey(key);
    const ttl = options?.ttl || this.defaultTTL;
    
    this.cache.set(fullKey, {
      data: value,
      expires: Date.now() + ttl * 1000
    });
  }

  async del(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);
    this.cache.delete(fullKey);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
} 