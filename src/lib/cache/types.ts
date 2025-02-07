export interface CacheOptions {
  ttl?: number;
  prefix?: string;
}

export interface CacheValue<T = any> {
  data: T;
  expires: number;
}

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface CacheConfig {
  driver: 'memory' | 'redis';
  redis?: {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
    db?: number;
  };
  prefix?: string;
  ttl?: number;
} 