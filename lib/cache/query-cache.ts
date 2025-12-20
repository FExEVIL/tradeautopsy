/**
 * Query Cache Layer
 * Request deduplication and Supabase-specific caching functions
 */

import { createClient } from '@/utils/supabase/server'
import { getCache, setCache, deleteCache, CacheKeys, CacheTTL, CacheTags, type CacheOptions } from './redis'

// ============================================
// REQUEST DEDUPLICATION
// ============================================

const inFlightRequests = new Map<string, Promise<any>>()

/**
 * Deduplicate identical in-flight requests
 */
async function deduplicateRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if request is already in flight
  const existingRequest = inFlightRequests.get(key)
  if (existingRequest) {
    return existingRequest as Promise<T>
  }

  // Create new request
  const request = fetcher()
    .then((result) => {
      inFlightRequests.delete(key)
      return result
    })
    .catch((error) => {
      inFlightRequests.delete(key)
      throw error
    })

  inFlightRequests.set(key, request)
  return request
}

// ============================================
// SUPABASE-SPECIFIC CACHING FUNCTIONS
// ============================================

/**
 * Get cached trades with automatic deduplication
 */
export async function getCachedTrades(
  userId: string,
  profileId: string | null,
  filters?: {
    startDate?: Date
    endDate?: Date
    symbol?: string
    strategy?: string
    page?: number
    pageSize?: number
  },
  options: CacheOptions = {}
): Promise<any[]> {
  const cacheKey = CacheKeys.trades(userId, profileId, filters)
  const tag = CacheTags.trades(userId, profileId)

  // Try cache first
  const cached = await getCache<any[]>(cacheKey, options)
  if (cached) {
    return cached
  }

  // Fetch with deduplication
  return deduplicateRequest(cacheKey, async () => {
    const supabase = await createClient()

    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('trade_date', { ascending: false })

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
      query = query.or(`symbol.ilike.%${filters.symbol}%,tradingsymbol.ilike.%${filters.symbol}%`)
    }

    if (filters?.strategy) {
      query = query.eq('strategy', filters.strategy)
    }

    if (filters?.pageSize) {
      const offset = (filters.page || 0) * filters.pageSize
      query = query.range(offset, offset + filters.pageSize - 1)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const trades = data || []

    // Cache the result
    await setCache(cacheKey, trades, {
      ttl: CacheTTL.trades,
      tags: [tag],
      ...options,
    })

    return trades
  })
}

/**
 * Get cached dashboard metrics
 */
export async function getCachedDashboardMetrics(
  userId: string,
  profileId: string | null,
  dateRange?: { start?: Date; end?: Date },
  options: CacheOptions = {}
): Promise<{
  totalTrades: number
  totalPnl: number
  winRate: number
  winningTrades: number
  losingTrades: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  totalVolume: number
}> {
  const cacheKey = CacheKeys.dashboard(userId, profileId, dateRange)
  const tag = CacheTags.dashboard(userId, profileId)

  // Try cache first
  const cached = await getCache(cacheKey, options)
  if (cached) {
    return cached
  }

  // Fetch with deduplication
  return deduplicateRequest(cacheKey, async () => {
    const supabase = await createClient()

    // Try RPC function first (fastest)
    try {
      const { data, error } = await supabase.rpc('get_dashboard_metrics', {
        p_user_id: userId,
        p_profile_id: profileId || null,
        p_start_date: dateRange?.start?.toISOString().split('T')[0] || null,
        p_end_date: dateRange?.end?.toISOString().split('T')[0] || null,
      })

      if (!error && data) {
        const metrics = {
          totalTrades: data.total_trades || 0,
          totalPnl: parseFloat(String(data.total_pnl || 0)),
          winRate: parseFloat(String(data.win_rate || 0)),
          winningTrades: data.winning_trades || 0,
          losingTrades: data.losing_trades || 0,
          avgWin: parseFloat(String(data.avg_winner || 0)),
          avgLoss: parseFloat(String(data.avg_loser || 0)),
          largestWin: parseFloat(String(data.max_profit || 0)),
          largestLoss: parseFloat(String(data.max_loss || 0)),
          totalVolume: parseFloat(String(data.total_volume || 0)),
        }

        // Cache the result
        await setCache(cacheKey, metrics, {
          ttl: CacheTTL.dashboard,
          tags: [tag],
          ...options,
        })

        return metrics
      }
    } catch (error) {
      console.warn('RPC function not available, using fallback query')
    }

    // Fallback: Query trades and calculate metrics
    let query = supabase
      .from('trades')
      .select('pnl, quantity, entry_price')
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    if (dateRange?.start) {
      query = query.gte('trade_date', dateRange.start.toISOString().split('T')[0])
    }

    if (dateRange?.end) {
      query = query.lte('trade_date', dateRange.end.toISOString().split('T')[0])
    }

    const { data: trades, error } = await query

    if (error) {
      throw error
    }

    const totalTrades = trades?.length || 0
    const totalPnl = trades?.reduce((sum, t) => sum + parseFloat(String(t.pnl || 0)), 0) || 0
    const winningTrades = trades?.filter((t) => parseFloat(String(t.pnl || 0)) > 0).length || 0
    const losingTrades = totalTrades - winningTrades
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    const wins = trades?.filter((t) => parseFloat(String(t.pnl || 0)) > 0).map((t) => parseFloat(String(t.pnl || 0))) || []
    const losses = trades?.filter((t) => parseFloat(String(t.pnl || 0)) < 0).map((t) => parseFloat(String(t.pnl || 0))) || []

    const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0
    const largestWin = wins.length > 0 ? Math.max(...wins) : 0
    const largestLoss = losses.length > 0 ? Math.min(...losses) : 0

    const totalVolume =
      trades?.reduce(
        (sum, t) => sum + Math.abs(parseFloat(String(t.quantity || 0)) * parseFloat(String(t.entry_price || 0))),
        0
      ) || 0

    const metrics = {
      totalTrades,
      totalPnl,
      winRate,
      winningTrades,
      losingTrades,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      totalVolume,
    }

    // Cache the result
    await setCache(cacheKey, metrics, {
      ttl: CacheTTL.dashboard,
      tags: [tag],
      ...options,
    })

    return metrics
  })
}

/**
 * Get cached symbol performance
 */
export async function getCachedSymbolPerformance(
  userId: string,
  profileId: string | null,
  symbol: string,
  options: CacheOptions = {}
): Promise<{
  symbol: string
  totalTrades: number
  totalPnl: number
  winRate: number
  avgPnl: number
}> {
  const cacheKey = CacheKeys.symbolPerformance(userId, profileId, symbol)
  const tag = CacheTags.trades(userId, profileId)

  // Try cache first
  const cached = await getCache(cacheKey, options)
  if (cached) {
    return cached
  }

  // Fetch with deduplication
  return deduplicateRequest(cacheKey, async () => {
    const supabase = await createClient()

    // Try RPC function first
    try {
      const { data, error } = await supabase.rpc('get_performance_by_symbol', {
        p_user_id: userId,
        p_profile_id: profileId || null,
        p_symbol: symbol,
        p_limit: 1,
      })

      if (!error && data && data.length > 0) {
        const result = {
          symbol: data[0].symbol,
          totalTrades: Number(data[0].total_trades),
          totalPnl: parseFloat(String(data[0].total_pnl)),
          winRate: parseFloat(String(data[0].win_rate)),
          avgPnl: parseFloat(String(data[0].avg_pnl)),
        }

        await setCache(cacheKey, result, {
          ttl: CacheTTL.symbolPerformance,
          tags: [tag],
          ...options,
        })

        return result
      }
    } catch (error) {
      console.warn('RPC function not available, using fallback query')
    }

    // Fallback: Query trades
    let query = supabase
      .from('trades')
      .select('pnl')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .or(`symbol.ilike.%${symbol}%,tradingsymbol.ilike.%${symbol}%`)

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data: trades, error } = await query

    if (error) {
      throw error
    }

    const totalTrades = trades?.length || 0
    const totalPnl = trades?.reduce((sum, t) => sum + parseFloat(String(t.pnl || 0)), 0) || 0
    const winningTrades = trades?.filter((t) => parseFloat(String(t.pnl || 0)) > 0).length || 0
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
    const avgPnl = totalTrades > 0 ? totalPnl / totalTrades : 0

    const result = {
      symbol,
      totalTrades,
      totalPnl,
      winRate,
      avgPnl,
    }

    await setCache(cacheKey, result, {
      ttl: CacheTTL.symbolPerformance,
      tags: [tag],
      ...options,
    })

    return result
  })
}

/**
 * Get cached daily P&L
 */
export async function getCachedDailyPnl(
  userId: string,
  profileId: string | null,
  days: number = 30,
  options: CacheOptions = {}
): Promise<Array<{ date: string; pnl: number; tradesCount: number }>> {
  const cacheKey = CacheKeys.dailyPnl(userId, profileId, days)
  const tag = CacheTags.dashboard(userId, profileId)

  // Try cache first
  const cached = await getCache(cacheKey, options)
  if (cached) {
    return cached
  }

  // Fetch with deduplication
  return deduplicateRequest(cacheKey, async () => {
    const supabase = await createClient()

    // Try RPC function first
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase.rpc('get_daily_pnl', {
        p_user_id: userId,
        p_profile_id: profileId || null,
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: new Date().toISOString().split('T')[0],
      })

      if (!error && data) {
        const result = data.map((row: any) => ({
          date: row.date,
          pnl: parseFloat(String(row.pnl || 0)),
          tradesCount: Number(row.trades_count || 0),
        }))

        await setCache(cacheKey, result, {
          ttl: CacheTTL.dailyPnl,
          tags: [tag],
          ...options,
        })

        return result
      }
    } catch (error) {
      console.warn('RPC function not available, using fallback query')
    }

    // Fallback: Query trades
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    let query = supabase
      .from('trades')
      .select('trade_date, pnl')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('trade_date', startDate.toISOString().split('T')[0])
      .order('trade_date', { ascending: true })

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data: trades, error } = await query

    if (error) {
      throw error
    }

    // Group by date
    const dailyMap = new Map<string, { pnl: number; count: number }>()

    trades?.forEach((trade) => {
      const date = trade.trade_date
      const pnl = parseFloat(String(trade.pnl || 0))

      if (!dailyMap.has(date)) {
        dailyMap.set(date, { pnl: 0, count: 0 })
      }

      const dayData = dailyMap.get(date)!
      dayData.pnl += pnl
      dayData.count += 1
    })

    const result = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        pnl: data.pnl,
        tradesCount: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    await setCache(cacheKey, result, {
      ttl: CacheTTL.dailyPnl,
      tags: [tag],
      ...options,
    })

    return result
  })
}

/**
 * Get cached insights
 */
export async function getCachedInsights(
  userId: string,
  profileId: string | null,
  options: CacheOptions = {}
): Promise<any[]> {
  const cacheKey = CacheKeys.insights(userId, profileId)
  const tag = CacheTags.insights(userId, profileId)

  // Try cache first
  const cached = await getCache<any[]>(cacheKey, options)
  if (cached) {
    return cached
  }

  // Fetch with deduplication
  return deduplicateRequest(cacheKey, async () => {
    const supabase = await createClient()

    let query = supabase
      .from('tai_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(50)

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const insights = data || []

    await setCache(cacheKey, insights, {
      ttl: CacheTTL.insights,
      tags: [tag],
      ...options,
    })

    return insights
  })
}

// ============================================
// CACHE INVALIDATION HELPERS
// ============================================

/**
 * Invalidate trades cache after trade mutations
 */
export async function invalidateTradesCaches(userId: string, profileId: string | null): Promise<void> {
  const tag = CacheTags.trades(userId, profileId)
  const { invalidateByTag } = await import('./redis')
  await invalidateByTag(tag)
}

/**
 * Invalidate dashboard cache after trade mutations
 */
export async function invalidateDashboardCaches(userId: string, profileId: string | null): Promise<void> {
  const tag = CacheTags.dashboard(userId, profileId)
  const { invalidateByTag } = await import('./redis')
  await invalidateByTag(tag)
}

/**
 * Invalidate insights cache after insight mutations
 */
export async function invalidateInsightsCaches(userId: string, profileId: string | null): Promise<void> {
  const tag = CacheTags.insights(userId, profileId)
  const { invalidateByTag } = await import('./redis')
  await invalidateByTag(tag)
}

