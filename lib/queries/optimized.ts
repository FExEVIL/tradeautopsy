import { SupabaseClient } from '@supabase/supabase-js'

// ✅ Fetch only required fields for dashboard
export async function getDashboardMetrics(
  supabase: SupabaseClient,
  userId: string,
  profileId?: string | null
) {
  // Use RPC function if available, otherwise fallback to client-side aggregation
  try {
    const { data, error } = await supabase.rpc('get_dashboard_metrics', {
      p_user_id: userId,
      p_profile_id: profileId || null,
      p_days: 30,
    })

    if (!error && data && data.length > 0) {
      return data[0]
    }
  } catch (err) {
    console.warn('RPC function not available, using client-side aggregation')
  }

  // Fallback: client-side aggregation
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
}

// ✅ Paginated trades fetch
export async function getTradesPaginated(
  supabase: SupabaseClient,
  userId: string,
  page: number = 0,
  pageSize: number = 50,
  profileId?: string | null
) {
  let query = supabase
    .from('trades')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('trade_date', { ascending: false })

  if (profileId) {
    query = query.eq('profile_id', profileId)
  }

  const { data, error, count } = await query
    .range(page * pageSize, (page + 1) * pageSize - 1)

  return {
    trades: data || [],
    totalCount: count || 0,
    hasMore: (count || 0) > (page + 1) * pageSize,
    error,
  }
}

// ✅ Aggregated query for calendar using RPC
export async function getCalendarData(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string,
  profileId?: string | null
) {
  try {
    // Use RPC function for server-side aggregation
    const { data, error } = await supabase.rpc('get_daily_pnl', {
      p_user_id: userId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_profile_id: profileId || null,
    })

    if (!error && data) {
      // Convert to dailyData format
      const dailyData: { [date: string]: { pnl: number; trades: any[]; count: number } } = {}
      data.forEach((row: any) => {
        dailyData[row.date] = {
          pnl: parseFloat(String(row.total_pnl || 0)),
          trades: [],
          count: row.trade_count || 0,
        }
      })
      return dailyData
    }
  } catch (err) {
    console.warn('RPC function not available, using client-side aggregation')
  }

  // Fallback: client-side aggregation
  let query = supabase
    .from('trades')
    .select('trade_date, pnl')
    .eq('user_id', userId)
    .gte('trade_date', startDate)
    .lte('trade_date', endDate)
    .is('deleted_at', null)
    .order('trade_date', { ascending: true })

  if (profileId) {
    query = query.eq('profile_id', profileId)
  }

  const { data: trades, error } = await query

  if (error) {
    console.error('Error fetching calendar data:', error)
    return {}
  }

  // Aggregate by date
  const dailyData: { [date: string]: { pnl: number; trades: any[]; count: number } } = {}
  trades?.forEach((trade) => {
    const date = new Date(trade.trade_date).toISOString().split('T')[0]
    if (!dailyData[date]) {
      dailyData[date] = { pnl: 0, trades: [], count: 0 }
    }
    dailyData[date].pnl += parseFloat(String(trade.pnl || 0))
    dailyData[date].trades.push(trade)
    dailyData[date].count++
  })

  return dailyData
}
