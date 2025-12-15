import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import { format, parseISO } from 'date-fns'
import { DailyMetricsCards } from './components/DailyMetricsCards'
import { DailyEquityCurve } from './components/DailyEquityCurve'
import { DailyTradesList } from './components/DailyTradesList'
import { DailyPerformanceHeader } from '../components/DailyPerformanceHeader'
import { PrintStyles } from './components/PrintStyles'

interface PageProps {
  params: Promise<{ date: string }>
}

export default async function DailyPerformancePage({ params }: PageProps) {
  const { date } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profileId = await getCurrentProfileId(user.id)

  // Parse date and format for query
  let targetDate: Date
  try {
    targetDate = parseISO(date)
    if (isNaN(targetDate.getTime())) {
      return notFound()
    }
  } catch {
    return notFound()
  }

  const dateStr = format(targetDate, 'yyyy-MM-dd')
  
  // Calculate next day for upper bound (for range query)
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)
  const nextDayStr = format(nextDay, 'yyyy-MM-dd')

  // Fetch trades for this specific date
  // trade_date can be stored as:
  // 1. YYYY-MM-DD string (e.g., '2024-03-23')
  // 2. Timestamp string (e.g., '2024-03-23T10:30:00')
  // Use range query to handle all formats (matches dashboard page pattern)
  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  // Apply profile filter first (if exists)
  if (profileId) {
    query = query.eq('profile_id', profileId)
  }

  // Filter by date using range query (matches pattern from dashboard/page.tsx)
  // This handles both date-only strings and timestamps
  query = query
    .gte('trade_date', dateStr)
    .lt('trade_date', nextDayStr)
    .order('created_at', { ascending: true })

  const { data: trades, error: queryError } = await query

  if (queryError) {
    console.error('[Daily Performance] Query error:', queryError)
  }

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Daily Performance] Date filter:', {
      dateStr,
      nextDayStr,
      profileId: profileId || 'none',
      userId: user.id,
      tradesFound: trades?.length || 0,
      queryError: queryError?.message || null
    })
    
    // Log sample trade dates if found
    if (trades && trades.length > 0) {
      console.log('[Daily Performance] Sample trade dates:', 
        trades.slice(0, 3).map(t => t.trade_date)
      )
    }
  }

  if (!trades || trades.length === 0) {
    return (
      <>
        <PrintStyles />
        <div className="min-h-screen bg-[#0a0a0a] p-6 space-y-6">
          <DailyPerformanceHeader date={date} />
          <div className="text-center py-12 bg-[#0F0F0F] border border-white/5 rounded-xl">
            <p className="text-gray-400 mb-2">No trades found for {format(targetDate, 'MMMM d, yyyy')}</p>
            <p className="text-sm text-gray-500 mb-4">
              Try selecting a different date from the calendar, or check if trades exist for this date.
            </p>
            <a
              href="/dashboard/calendar"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm text-white"
            >
              ← Back to Calendar
            </a>
          </div>
        </div>
      </>
    )
  }

  // Calculate comprehensive daily metrics
  const totalPnL = trades.reduce((sum, t) => sum + (parseFloat(String(t.pnl || 0))), 0)
  const winningTrades = trades.filter(t => (parseFloat(String(t.pnl || 0)) > 0))
  const losingTrades = trades.filter(t => (parseFloat(String(t.pnl || 0)) < 0))
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0
  
  const avgProfit = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + parseFloat(String(t.pnl || 0)), 0) / winningTrades.length
    : 0
  
  const avgLoss = losingTrades.length > 0
    ? losingTrades.reduce((sum, t) => sum + parseFloat(String(t.pnl || 0)), 0) / losingTrades.length
    : 0
  
  const profitFactor = avgLoss !== 0 ? Math.abs(avgProfit / avgLoss) : 0
  const riskRewardRatio = avgLoss !== 0 ? `1 : ${Math.abs(avgProfit / avgLoss).toFixed(2)}` : 'N/A'

  // Calculate drawdown for this day
  let runningPnL = 0
  let peak = 0
  let maxDrawdown = 0

  trades.forEach(trade => {
    runningPnL += parseFloat(String(trade.pnl || 0))
    if (runningPnL > peak) peak = runningPnL
    const drawdown = peak - runningPnL
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  })

  const metrics = {
    totalPnL,
    winRate: winRate.toFixed(1),
    avgProfit,
    avgLoss,
    profitFactor: profitFactor.toFixed(2),
    riskRewardRatio,
    maxDrawdown,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
  }

  return (
    <>
      <PrintStyles />
      <div id="daily-performance-page" className="min-h-screen bg-[#0a0a0a] p-6 space-y-6">
        {/* Header */}
        <DailyPerformanceHeader date={date} />

        {/* Metrics Cards */}
        <DailyMetricsCards metrics={metrics} />

        {/* Equity Curve */}
        <DailyEquityCurve trades={trades} />

        {/* Trades List */}
        <DailyTradesList trades={trades} />
      </div>
    </>
  )
}
