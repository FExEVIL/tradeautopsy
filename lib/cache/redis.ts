/**
 * Multi-Layer Caching System for TradeAutopsy
 * 
 * Layer 1: In-Memory LRU Cache (fastest, per-instance)
 * Layer 2: Redis Cache (shared across instances)
 * Layer 3: Database (source of truth)
 */

import { LRUCache } from 'lru-cache';

// ============================================
// TYPES
// ============================================

interface CacheConfig {
  ttl: number;
  staleWhileRevalidate?: boolean;
  tags?: string[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_TTL = 300;
const MAX_LOCAL_CACHE_SIZE = 500;
const STALE_THRESHOLD = 0.8;

const CACHE_PREFIXES = {
  TRADES: 'trades:',
  DASHBOARD: 'dashboard:',
  INSIGHTS: 'insights:',
  USER: 'user:',
  METRICS: 'metrics:',
  CHART: 'chart:',
} as const;

// ============================================
// LOCAL LRU CACHE
// ============================================

const localCache = new LRUCache<string, CacheEntry<unknown>>({
  max: MAX_LOCAL_CACHE_SIZE,
  ttl: 1000 * 60 * 5,
  updateAgeOnGet: true,
  allowStale: true,
});

// ============================================
// REDIS CLIENT
// ============================================

let redisClient: any = null;

function createRedisClient() {
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
  
  if (!redisUrl) {
    return null;
  }

  try {
    const Redis = require('ioredis');
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
      lazyConnect: true,
    });

    client.on('error', (err: Error) => {
      console.error('[Cache] Redis error:', err.message);
    });

    return client;
  } catch {
    return null;
  }
}

function getRedisClient() {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

// ============================================
// SERIALIZATION
// ============================================

const defaultSerializer = {
  serialize: (data: unknown) => JSON.stringify(data),
  deserialize: <T>(data: string) => JSON.parse(data) as T,
};

// ============================================
// CACHE CLASS
// ============================================

class Cache {
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig = { ttl: DEFAULT_TTL }
  ): Promise<T> {
    const { ttl, staleWhileRevalidate = true, tags = [] } = config;

    const localEntry = localCache.get(key) as CacheEntry<T> | undefined;
    
    if (localEntry) {
      const age = Date.now() - localEntry.timestamp;
      const maxAge = localEntry.ttl * 1000;
      
      if (age < maxAge) {
        if (staleWhileRevalidate && age > maxAge * STALE_THRESHOLD) {
          this.revalidateInBackground(key, fetcher, config);
        }
        return localEntry.data;
      }
    }

    const redis = getRedisClient();
    if (redis) {
      try {
        const redisData = await redis.get(key);
        if (redisData) {
          const entry = defaultSerializer.deserialize<CacheEntry<T>>(redisData);
          localCache.set(key, entry);
          return entry.data;
        }
      } catch (error) {
        console.error('[Cache] Redis get error:', error);
      }
    }

    const data = await fetcher();
    await this.set(key, data, config);
    return data;
  }

  async set<T>(
    key: string,
    data: T,
    config: CacheConfig = { ttl: DEFAULT_TTL }
  ): Promise<void> {
    const { ttl, tags = [] } = config;
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    };

    localCache.set(key, entry);

    const redis = getRedisClient();
    if (redis) {
      try {
        await redis.setex(key, ttl, defaultSerializer.serialize(entry));
        for (const tag of tags) {
          await redis.sadd(`tag:${tag}`, key);
          await redis.expire(`tag:${tag}`, ttl * 2);
        }
      } catch (error) {
        console.error('[Cache] Redis set error:', error);
      }
    }
  }

  async invalidate(key: string): Promise<void> {
    localCache.delete(key);
    const redis = getRedisClient();
    if (redis) {
      try {
        await redis.del(key);
      } catch (error) {
        console.error('[Cache] Redis invalidate error:', error);
      }
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    const redis = getRedisClient();
    if (redis) {
      try {
        const keys = await redis.smembers(`tag:${tag}`);
        if (keys.length > 0) {
          await redis.del(...keys);
          await redis.del(`tag:${tag}`);
        }
      } catch (error) {
        console.error('[Cache] Redis tag invalidation error:', error);
      }
    }

    for (const [key, entry] of localCache.entries()) {
      if ((entry as CacheEntry<unknown>).tags?.includes(tag)) {
        localCache.delete(key);
      }
    }
  }

  async invalidateUser(userId: string): Promise<void> {
    await this.invalidateByTag(`user:${userId}`);
  }

  async invalidateProfile(userId: string, profileId: string): Promise<void> {
    await this.invalidateByTag(`profile:${userId}:${profileId}`);
  }

  async clear(): Promise<void> {
    localCache.clear();
    const redis = getRedisClient();
    if (redis) {
      try {
        await redis.flushdb();
      } catch (error) {
        console.error('[Cache] Redis clear error:', error);
      }
    }
  }

  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<void> {
    fetcher()
      .then((data) => this.set(key, data, config))
      .catch((error) => {
        console.error('[Cache] Background revalidation failed:', error);
      });
  }
}

// ============================================
// EXPORTS
// ============================================

export const cache = new Cache();

export const cacheKeys = {
  trades: (userId: string, profileId: string, page?: number) =>
    `${CACHE_PREFIXES.TRADES}${userId}:${profileId}${page ? `:page:${page}` : ''}`,
  
  dashboard: (userId: string, profileId: string, range?: string) =>
    `${CACHE_PREFIXES.DASHBOARD}${userId}:${profileId}${range ? `:${range}` : ''}`,
  
  insights: (userId: string, profileId: string) =>
    `${CACHE_PREFIXES.INSIGHTS}${userId}:${profileId}`,
  
  metrics: (userId: string, profileId: string, type: string) =>
    `${CACHE_PREFIXES.METRICS}${userId}:${profileId}:${type}`,
  
  chartData: (userId: string, profileId: string, chartType: string, range: string) =>
    `${CACHE_PREFIXES.CHART}${userId}:${profileId}:${chartType}:${range}`,
  
  user: (userId: string) =>
    `${CACHE_PREFIXES.USER}${userId}`,
};

export const cacheTags = {
  userTrades: (userId: string) => `user:${userId}:trades`,
  profileTrades: (userId: string, profileId: string) => `profile:${userId}:${profileId}:trades`,
  userInsights: (userId: string) => `user:${userId}:insights`,
  userDashboard: (userId: string) => `user:${userId}:dashboard`,
};

export const cacheConfigs = {
  trades: (userId: string, profileId: string): CacheConfig => ({
    ttl: 300,
    staleWhileRevalidate: true,
    tags: [
      `user:${userId}`,
      `profile:${userId}:${profileId}`,
      cacheTags.userTrades(userId),
      cacheTags.profileTrades(userId, profileId),
    ],
  }),
  
  dashboard: (userId: string, profileId: string): CacheConfig => ({
    ttl: 600,
    staleWhileRevalidate: true,
    tags: [
      `user:${userId}`,
      `profile:${userId}:${profileId}`,
      cacheTags.userDashboard(userId),
    ],
  }),
  
  insights: (userId: string, profileId: string): CacheConfig => ({
    ttl: 900,
    staleWhileRevalidate: true,
    tags: [
      `user:${userId}`,
      cacheTags.userInsights(userId),
    ],
  }),
  
  chartData: (userId: string, profileId: string): CacheConfig => ({
    ttl: 1800,
    staleWhileRevalidate: true,
    tags: [
      `user:${userId}`,
      `profile:${userId}:${profileId}`,
    ],
  }),
  
  userProfile: (userId: string): CacheConfig => ({
    ttl: 3600,
    staleWhileRevalidate: false,
    tags: [`user:${userId}`],
  }),
};

export { CACHE_PREFIXES };
export type { CacheConfig, CacheEntry };
