/**
 * Optimized Database Query Utilities with Caching
 * Reduces TTFB and improves dashboard performance
 */

import { createClient } from '@/utils/supabase/server'

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>()
const DEFAULT_CACHE_TTL = 30000 // 30 seconds

/**
 * Get cached data or fetch and cache
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<T> {
  const cached = cache.get(key)
  const now = Date.now()

  // Return cached data if still valid
  if (cached && (now - cached.timestamp) < ttl) {
    return cached.data
  }

  // Fetch fresh data
  const data = await fetcher()
  
  // Cache the result
  cache.set(key, { data, timestamp: now })
  
  // Clean up old cache entries (keep cache size manageable)
  if (cache.size > 100) {
    const oldestKey = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0]
    if (oldestKey) {
      cache.delete(oldestKey)
    }
  }

  return data
}

/**
 * Clear cache for a specific key or all cache
 */
export function clearCache(key?: string) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

/**
 * Optimized dashboard metrics query
 * Uses RPC if available, otherwise falls back to optimized select
 */
export async function getDashboardMetrics(
  userId: string,
  profileId: string | null = null,
  startDate?: Date,
  endDate?: Date
) {
  const cacheKey = `dashboard:${userId}:${profileId || 'all'}:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'all'}`

  return getCachedData(cacheKey, async () => {
    const supabase = await createClient()

    // Try to use RPC function first (fastest)
    try {
      const { data, error } = await supabase.rpc('get_user_metrics_fast', {
        p_user_id: userId,
        p_profile_id: profileId,
        p_start_date: startDate?.toISOString().split('T')[0] || null,
        p_end_date: endDate?.toISOString().split('T')[0] || null,
      })

      if (!error && data) {
        return data
      }
    } catch (error) {
      // RPC might not exist, fall back to query
      console.warn('RPC function not available, using fallback query')
    }

    // Fallback: Optimized query with only needed columns
    let query = supabase
      .from('trades')
      .select('pnl, trade_date, status') // Only fetch what we need
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    if (startDate) {
      query = query.gte('trade_date', startDate.toISOString().split('T')[0])
    }

    if (endDate) {
      query = query.lte('trade_date', endDate.toISOString().split('T')[0])
    }

    const { data: trades, error } = await query

    if (error) {
      throw error
    }

    // Calculate metrics client-side (reduces DB load)
    const totalPnl = trades.reduce((sum, t) => sum + parseFloat(String(t.pnl || '0')), 0)
    const winningTrades = trades.filter(t => parseFloat(String(t.pnl || '0')) > 0).length
    const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0
    const totalTrades = trades.length

    return {
      totalPnl,
      winRate,
      totalTrades,
      winningTrades,
      losingTrades: totalTrades - winningTrades,
    }
  }, 30000) // Cache for 30 seconds
}

/**
 * Optimized paginated trades query
 */
export async function getTradesPaginated(
  userId: string,
  profileId: string | null = null,
  page: number = 0,
  pageSize: number = 20,
  filters?: {
    startDate?: Date
    endDate?: Date
    symbol?: string
  }
) {
  const start = page * pageSize
  const end = start + pageSize - 1

  const supabase = await createClient()

  let query = supabase
    .from('trades')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('trade_date', { ascending: false })
    .range(start, end)

  if (profileId) {
    query = query.eq('profile_id', profileId)
  }

  if (filters?.startDate) {
    query = query.gte('trade_date', filters.startDate.toISOString().split('T')[0])
  }

  if (filters?.endDate) {
    query = query.lte('trade_date', filters.endDate.toISOString().split('T')[0])
  }

  if (filters?.symbol) {
    query = query.ilike('symbol', `%${filters.symbol}%`)
  }

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  return {
    trades: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
    currentPage: page,
  }
}

/**
 * Get recent trades for quick display (optimized)
 */
export async function getRecentTrades(
  userId: string,
  profileId: string | null = null,
  limit: number = 10
) {
  const cacheKey = `recent-trades:${userId}:${profileId || 'all'}:${limit}`

  return getCachedData(cacheKey, async () => {
    const supabase = await createClient()

    let query = supabase
      .from('trades')
      .select('id, trade_date, symbol, pnl, quantity, strategy') // Only needed columns
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('trade_date', { ascending: false })
      .limit(limit)

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data || []
  }, 15000) // Cache for 15 seconds
}

