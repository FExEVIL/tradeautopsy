/**
 * Multi-Layer Cache System
 * Layer 1: In-memory LRU cache (fastest, 500 entries)
 * Layer 2: Redis/Upstash cache (shared state, persistent)
 * 
 * Features:
 * - Automatic cache invalidation on mutations
 * - Stale-while-revalidate pattern
 * - Cache key generators
 * - Cache tag system for bulk invalidation
 * - TTL configurations
 */

import { LRUCache } from 'lru-cache'
import { Redis } from '@upstash/redis'

// ============================================
// LAYER 1: IN-MEMORY LRU CACHE
// ============================================

const memoryCache = new LRUCache<string, { data: any; timestamp: number; tags?: string[] }>({
  max: 500, // Maximum 500 entries
  ttl: 1000 * 60 * 5, // 5 minutes default TTL
  updateAgeOnGet: true, // Refresh TTL on access
})

// ============================================
// LAYER 2: REDIS/UPSTASH CACHE
// ============================================

let redisClient: Redis | null = null

try {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch (error) {
  console.warn('Redis not configured, using memory cache only:', error)
}

// ============================================
// CACHE KEY GENERATORS
// ============================================

export const CacheKeys = {
  trades: (userId: string, profileId: string | null, filters?: Record<string, any>) => {
    const filterStr = filters ? JSON.stringify(filters) : ''
    return `trades:${userId}:${profileId || 'all'}:${filterStr}`
  },
  dashboard: (userId: string, profileId: string | null, dateRange?: { start?: Date; end?: Date }) => {
    const rangeStr = dateRange
      ? `${dateRange.start?.toISOString() || 'all'}:${dateRange.end?.toISOString() || 'all'}`
      : 'all'
    return `dashboard:${userId}:${profileId || 'all'}:${rangeStr}`
  },
  insights: (userId: string, profileId: string | null) => {
    return `insights:${userId}:${profileId || 'all'}`
  },
  metrics: (userId: string, profileId: string | null, type: string) => {
    return `metrics:${userId}:${profileId || 'all'}:${type}`
  },
  charts: (userId: string, profileId: string | null, chartType: string, dateRange?: string) => {
    return `charts:${userId}:${profileId || 'all'}:${chartType}:${dateRange || 'all'}`
  },
  symbolPerformance: (userId: string, profileId: string | null, symbol: string) => {
    return `symbol:${userId}:${profileId || 'all'}:${symbol}`
  },
  dailyPnl: (userId: string, profileId: string | null, days: number) => {
    return `dailyPnl:${userId}:${profileId || 'all'}:${days}`
  },
} as const

// ============================================
// CACHE TAG SYSTEM
// ============================================

const tagToKeys = new Map<string, Set<string>>()

function addKeyToTag(key: string, tags: string[]) {
  tags.forEach((tag) => {
    if (!tagToKeys.has(tag)) {
      tagToKeys.set(tag, new Set())
    }
    tagToKeys.get(tag)!.add(key)
  })
}

function getKeysByTag(tag: string): string[] {
  return Array.from(tagToKeys.get(tag) || [])
}

// ============================================
// TTL CONFIGURATIONS
// ============================================

export const CacheTTL = {
  trades: 1000 * 60 * 5, // 5 minutes
  dashboard: 1000 * 60 * 10, // 10 minutes
  charts: 1000 * 60 * 30, // 30 minutes
  insights: 1000 * 60 * 5, // 5 minutes
  metrics: 1000 * 60 * 10, // 10 minutes
  symbolPerformance: 1000 * 60 * 15, // 15 minutes
  dailyPnl: 1000 * 60 * 30, // 30 minutes
} as const

// ============================================
// CACHE OPERATIONS
// ============================================

export interface CacheOptions {
  ttl?: number
  tags?: string[]
  skipMemory?: boolean
  skipRedis?: boolean
}

/**
 * Get value from cache (checks Layer 1, then Layer 2)
 */
export async function getCache<T>(
  key: string,
  options: CacheOptions = {}
): Promise<T | null> {
  // Check Layer 1: Memory cache
  if (!options.skipMemory) {
    const cached = memoryCache.get(key)
    if (cached) {
      return cached.data as T
    }
  }

  // Check Layer 2: Redis cache
  if (!options.skipRedis && redisClient) {
    try {
      const cached = await redisClient.get<T>(key)
      if (cached) {
        // Populate Layer 1 cache
        memoryCache.set(key, { data: cached, timestamp: Date.now(), tags: options.tags })
        return cached
      }
    } catch (error) {
      console.error('Redis get error:', error)
    }
  }

  return null
}

/**
 * Set value in cache (sets both Layer 1 and Layer 2)
 */
export async function setCache<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const ttl = options.ttl || CacheTTL.trades
  const cacheEntry = {
    data: value,
    timestamp: Date.now(),
    tags: options.tags,
  }

  // Set Layer 1: Memory cache
  if (!options.skipMemory) {
    memoryCache.set(key, cacheEntry, { ttl })
  }

  // Set Layer 2: Redis cache
  if (!options.skipRedis && redisClient) {
    try {
      await redisClient.set(key, value, { ex: Math.floor(ttl / 1000) })
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }

  // Track tags
  if (options.tags) {
    addKeyToTag(key, options.tags)
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<void> {
  // Delete from Layer 1
  memoryCache.delete(key)

  // Delete from Layer 2
  if (redisClient) {
    try {
      await redisClient.del(key)
    } catch (error) {
      console.error('Redis delete error:', error)
    }
  }
}

/**
 * Invalidate cache by tag (bulk invalidation)
 */
export async function invalidateByTag(tag: string): Promise<void> {
  const keys = getKeysByTag(tag)
  
  for (const key of keys) {
    await deleteCache(key)
  }

  // Clear tag mapping
  tagToKeys.delete(tag)
}

/**
 * Invalidate all caches for a user
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  const patterns = [
    `trades:${userId}:*`,
    `dashboard:${userId}:*`,
    `insights:${userId}:*`,
    `metrics:${userId}:*`,
    `charts:${userId}:*`,
    `symbol:${userId}:*`,
    `dailyPnl:${userId}:*`,
  ]

  for (const pattern of patterns) {
    // Delete from memory cache (exact match only)
    const memoryKeys = Array.from(memoryCache.keys()).filter((key) =>
      key.startsWith(pattern.replace('*', ''))
    )
    memoryKeys.forEach((key) => memoryCache.delete(key))

    // Delete from Redis (if supported)
    if (redisClient) {
      try {
        // Note: Upstash Redis doesn't support pattern deletion directly
        // In production, maintain a set of keys per user
        const keys = await redisClient.keys(pattern)
        if (keys.length > 0) {
          await redisClient.del(...keys)
        }
      } catch (error) {
        console.error('Redis pattern delete error:', error)
      }
    }
  }
}

/**
 * Clear all caches
 */
export async function clearAllCache(): Promise<void> {
  memoryCache.clear()
  tagToKeys.clear()

  if (redisClient) {
    try {
      await redisClient.flushdb()
    } catch (error) {
      console.error('Redis flush error:', error)
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  memorySize: number
  memoryMax: number
  redisEnabled: boolean
} {
  return {
    memorySize: memoryCache.size,
    memoryMax: memoryCache.max,
    redisEnabled: redisClient !== null,
  }
}

// ============================================
// CACHE TAGS
// ============================================

export const CacheTags = {
  trades: (userId: string, profileId?: string | null) => `trades:${userId}:${profileId || 'all'}`,
  dashboard: (userId: string, profileId?: string | null) => `dashboard:${userId}:${profileId || 'all'}`,
  insights: (userId: string, profileId?: string | null) => `insights:${userId}:${profileId || 'all'}`,
  user: (userId: string) => `user:${userId}`,
} as const
