import useSWR from 'swr'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// ✅ SWR configuration for optimal performance
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000, // Prevent duplicate requests within 5s
  focusThrottleInterval: 10000, // Throttle focus revalidation
  errorRetryCount: 2,
  errorRetryInterval: 1000,
}

// ✅ Fetcher function for trades
async function tradeFetcher(key: string) {
  const supabase = createClientComponentClient()
  const [_, dateRange] = key.split(':')
  
  if (!dateRange || dateRange === 'all') {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('trade_date', { ascending: false })
      .limit(1000)

    if (error) throw error
    return data
  }

  const [startDate, endDate] = dateRange.split('_')
  
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .gte('trade_date', startDate)
    .lte('trade_date', endDate)
    .order('trade_date', { ascending: false })

  if (error) throw error
  return data
}

// ✅ Hook for trades with caching
export function useTrades(startDate?: string, endDate?: string) {
  const key = startDate && endDate 
    ? `trades:${startDate}_${endDate}`
    : 'trades:all'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    tradeFetcher,
    swrConfig
  )

  return {
    trades: data || [],
    error,
    isLoading,
    refresh: mutate,
  }
}

// ✅ Hook for dashboard metrics with caching
export function useDashboardMetrics(userId?: string) {
  const supabase = createClientComponentClient()

  const { data, error, isLoading } = useSWR(
    userId ? ['dashboard-metrics', userId] : null,
    async ([_, userId]) => {
      // Fetch in parallel
      const [tradesRes, journalRes, goalsRes] = await Promise.all([
        supabase
          .from('trades')
          .select('pnl, trade_date')
          .eq('user_id', userId)
          .order('trade_date', { ascending: false })
          .limit(100),
        supabase
          .from('audio_journal_entries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('goals')
          .select('id, title, current_value, target_value')
          .eq('user_id', userId)
          .eq('completed', false),
      ])

      // Calculate metrics
      const trades = tradesRes.data || []
      const totalPnL = trades.reduce((sum, t) => sum + (parseFloat(String(t.pnl || 0))), 0)
      const wins = trades.filter(t => parseFloat(String(t.pnl || 0)) > 0).length
      const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0

      return {
        totalPnL,
        winRate,
        totalTrades: trades.length,
        journalProgress: journalRes.count || 0,
        activeGoals: goalsRes.data?.length || 0,
      }
    },
    {
      ...swrConfig,
      refreshInterval: 30000, // Refresh every 30s
    }
  )

  return {
    metrics: data,
    error,
    isLoading,
  }
}

// ✅ Hook for calendar daily P&L
export function useCalendarData(startDate: string, endDate: string) {
  const supabase = createClientComponentClient()

  const { data, error, isLoading } = useSWR(
    `calendar:${startDate}_${endDate}`,
    async () => {
      const { data: trades, error } = await supabase
        .from('trades')
        .select('trade_date, pnl')
        .gte('trade_date', startDate)
        .lte('trade_date', endDate)
        .order('trade_date', { ascending: true })

      if (error) throw error

      // Aggregate by date
      const dailyPnL = new Map<string, number>()
      trades?.forEach(trade => {
        const date = new Date(trade.trade_date).toISOString().split('T')[0]
        dailyPnL.set(date, (dailyPnL.get(date) || 0) + parseFloat(String(trade.pnl || 0)))
      })

      return Object.fromEntries(dailyPnL)
    },
    swrConfig
  )

  return {
    dailyData: data || {},
    error,
    isLoading,
  }
}
