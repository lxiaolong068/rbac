import { NextRequest, NextResponse } from 'next/server';
import {
  generateCacheKey,
  setCache,
  getCache,
  invalidateByTags,
  invalidateByKey,
  withCache,
  useServerCache,
} from '../cache';

// 模拟 logger
jest.mock('../logger', () => ({
  createErrorLogger: () => ({
    debug: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('Cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 清除所有缓存
    invalidateByTags(['*']);
  });

  describe('generateCacheKey', () => {
    it('should generate key without params', () => {
      const path = '/api/test';
      expect(generateCacheKey(path)).toBe(path);
    });

    it('should generate key with sorted params', () => {
      const path = '/api/test';
      const params = { b: 2, a: 1 };
      expect(generateCacheKey(path, params)).toBe('/api/test?a=1&b=2');
    });
  });

  describe('setCache and getCache', () => {
    it('should set and get cache', () => {
      const key = 'test-key';
      const data = { foo: 'bar' };
      const config = { duration: 60 }; // 60 seconds

      setCache(key, data, config);
      const cached = getCache(key);
      expect(cached).toEqual(data);
    });

    it('should return null for expired cache', () => {
      const key = 'test-key';
      const data = { foo: 'bar' };
      const config = { duration: 0 }; // Expire immediately

      setCache(key, data, config);
      const cached = getCache(key);
      expect(cached).toBeNull();
    });

    it('should handle cache with tags', () => {
      const key = 'test-key';
      const data = { foo: 'bar' };
      const config = { duration: 60, tags: ['test-tag'] };

      setCache(key, data, config);
      const cached = getCache(key);
      expect(cached).toEqual(data);
    });
  });

  describe('invalidateByTags', () => {
    it('should invalidate cache by tags', () => {
      const key1 = 'test-key-1';
      const key2 = 'test-key-2';
      const data = { foo: 'bar' };
      const config1 = { duration: 60, tags: ['tag1'] };
      const config2 = { duration: 60, tags: ['tag2'] };

      setCache(key1, data, config1);
      setCache(key2, data, config2);

      invalidateByTags(['tag1']);
      expect(getCache(key1)).toBeNull();
      expect(getCache(key2)).toEqual(data);
    });
  });

  describe('invalidateByKey', () => {
    it('should invalidate cache by key', () => {
      const key = 'test-key';
      const data = { foo: 'bar' };
      const config = { duration: 60 };

      setCache(key, data, config);
      invalidateByKey(key);
      expect(getCache(key)).toBeNull();
    });
  });

  describe('withCache', () => {
    it('should cache API response', async () => {
      const mockRequest = {
        url: '/api/test',
      } as unknown as NextRequest;

      const mockHandler = jest.fn().mockResolvedValue(
        NextResponse.json({ data: 'test' })
      );

      const cachedHandler = withCache({ duration: 60 })(mockHandler);

      // 第一次调用
      await cachedHandler(mockRequest);
      // 第二次调用应该使用缓存
      await cachedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('useServerCache', () => {
    it('should cache server component data', async () => {
      const key = 'test-server-cache';
      const mockFetcher = jest.fn().mockResolvedValue({ data: 'test' });
      const config = { duration: 60 };

      // 第一次调用
      const result1 = await useServerCache(key, mockFetcher, config);
      // 第二次调用应该使用缓存
      const result2 = await useServerCache(key, mockFetcher, config);

      expect(mockFetcher).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should handle fetcher errors', async () => {
      const key = 'test-error';
      const mockFetcher = jest.fn().mockRejectedValue(new Error('Fetch failed'));
      const config = { duration: 60 };

      await expect(useServerCache(key, mockFetcher, config)).rejects.toThrow('Fetch failed');
    });
  });
}); 