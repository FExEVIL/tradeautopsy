import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfileId } from '@/lib/profile-utils'
import DateRangeFilter from './components/DateRangeFilter'
import { TimeGranularityFilter } from './components/TimeGranularityFilter'
import { PnLIndicator } from '@/components/PnLIndicator'
import { getJournalProgress } from '@/lib/journal-utils-server'
import {
  calculateCumulativePnL,
  aggregateTradesByGranularity,
  calculateCumulativeFromAggregated,
  TimeGranularity,
} from '@/lib/calculations'
import { formatINR } from '@/lib/formatters'
import { format } from 'date-fns'
import { CumulativePnLChart } from './components/CumulativePnLChart'
import { BenchmarkCard } from './components/BenchmarkCard'
import { AnimatedProgressBar } from './components/AnimatedProgressBar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AICoachCard } from './components/AICoachCard'
import { PredictiveAlerts } from './components/PredictiveAlerts'
import { MorningBrief } from './components/MorningBrief'
import { FeatureGate } from '@/components/FeatureGate'

type DashboardSearchParams = {
  range?: string
  start?: string
  end?: string
  granularity?: TimeGranularity
}

type Trade = {
  id: string
  user_id: string
  trade_date: string
  symbol?: string | null
  pnl?: string | number | null
}

export default async function DashboardPage(
  props: { searchParams: Promise<DashboardSearchParams> }
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const searchParams = await props.searchParams

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const isAllRange = searchParams.range === 'ALL'
  const startDate = isAllRange ? new Date('2020-01-01') : (searchParams.start ? new Date(searchParams.start) : thirtyDaysAgo)
  const endDate = isAllRange ? new Date('2099-12-31') : (searchParams.end ? new Date(searchParams.end) : now)
  const granularity: TimeGranularity = searchParams.granularity || 'day'

  // Get current profile
  const profileId = await getCurrentProfileId(user.id)

  // Fetch trades with date filter (handle "All" range)
  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
  
  // Filter by profile if one is selected
  if (profileId) {
    query = query.eq('profile_id', profileId)
  }
  
  if (!isAllRange) {
    query = query
      .gte('trade_date', startDate.toISOString().split('T')[0])
      .lte('trade_date', endDate.toISOString().split('T')[0])
  }
  
  const { data: tradesRaw, error: tradesError } = await query.order('trade_date', { ascending: true })

  if (tradesError) {
    console.error('Trades fetch error:', tradesError)
  }

  const trades: Trade[] = (tradesRaw as Trade[] | null) ?? []

  // Calculate metrics based on granularity
  const aggregated = aggregateTradesByGranularity(trades as any, granularity)
  const cumulativeData = calculateCumulativeFromAggregated(aggregated)

  const netPnL = trades.reduce((sum, trade) => {
    const val = trade.pnl != null ? Number(trade.pnl) : 0
    return sum + (isNaN(val) ? 0 : val)
  }, 0)

  const progress = await getJournalProgress(user.id, profileId)

  const winCount = trades.filter(t => {
    const val = t.pnl != null ? Number(t.pnl) : 0
    return val > 0
  }).length

  const winRate =
    trades.length > 0 ? Math.round((winCount / trades.length) * 100) : 0

  const avgTrade = trades.length > 0 ? netPnL / trades.length : 0

  // Find best day trade (for tooltip)
  const bestDayTrade = trades.length > 0
    ? trades.reduce((best, trade) => {
        const bestVal = best.pnl != null ? Number(best.pnl) : 0
        const tradeVal = trade.pnl != null ? Number(trade.pnl) : 0
        return (isNaN(tradeVal) ? 0 : tradeVal) > (isNaN(bestVal) ? 0 : bestVal) ? trade : best
      }, trades[0])
    : null

  const bestDayPnL = bestDayTrade
    ? (bestDayTrade.pnl != null ? Number(bestDayTrade.pnl) : 0)
    : 0

  // Check if Zerodha is connected
  const { data: zerodhaToken } = await supabase
    .from('zerodha_tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .single()

  const isZerodhaConnected = !!zerodhaToken?.access_token

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            {isAllRange ? 'All Time' : `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ThemeToggle />
          <TimeGranularityFilter />
          <DateRangeFilter />
        </div>
      </div>

      {/* Morning Brief - Conditionally shown */}
      <FeatureGate feature="morning_brief">
        <MorningBrief />
      </FeatureGate>

      {/* Predictive Alerts - Show at top if any - Conditionally shown */}
      <FeatureGate feature="predictive_alerts">
        <PredictiveAlerts />
      </FeatureGate>

      {/* Top KPIs - Hero Net P&L + Journal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-8 rounded-2xl bg-[#0F0F0F] border border-white/5 lg:col-span-2">
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
            Net P&L
          </div>
          <PnLIndicator value={netPnL} variant="text" size="lg" />
        </div>

        <div className="p-8 rounded-2xl bg-[#0F0F0F] border border-white/5">
          <div className="text-sm text-gray-400 uppercase tracking-wider mb-4">
            Journal Progress
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {progress.journaled}/{progress.total}
          </div>
          <AnimatedProgressBar
            value={progress.percentage}
            barClassName="bg-gradient-to-r from-green-500 to-green-400"
            showLabel
          />
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Win Rate
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {winRate}%
          </div>
        </div>
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Total Trades
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {trades.length}
          </div>
        </div>
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Avg Trade
          </div>
          <PnLIndicator value={avgTrade} size="lg" />
        </div>
        <div className="p-6 rounded-xl bg-[#0F0F0F] border border-white/5 group relative">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Best Day
          </div>
          <div className="cursor-help">
            <PnLIndicator value={bestDayPnL} size="lg" />
          </div>
          {bestDayTrade && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10">
              <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-700 whitespace-nowrap">
                {format(new Date(bestDayTrade.trade_date), 'MMM dd, yyyy')}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>          )}
        </div>
      </div>

      {/* Charts Section - Cumulative P&L + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Cumulative P&L
          </h3>
          <div className="h-80">
            <CumulativePnLChart data={cumulativeData} granularity={granularity} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0F0F0F] border border-white/5">
          <h3 className="text-lg font-semibold mb-4 text-white">Recent Activity</h3>
          <div className="space-y-3">
            {trades.slice(0, 5).map(trade => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div>
                  <div className="font-mono text-sm text-white">
                    {trade.symbol || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(trade.trade_date).toLocaleDateString()}
                  </div>
                </div>
                <PnLIndicator
                  value={
                    trade.pnl != null && !isNaN(Number(trade.pnl))
                      ? Number(trade.pnl)
                      : 0
                  }
                  size="sm"
                />
              </div>
            ))}
            {trades.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No trades yet.{' '}
                <a
                  href="/dashboard/import"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Import Trades
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Coach & Benchmark - Conditionally shown based on profile features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeatureGate feature="ai_coach">
          <AICoachCard />
        </FeatureGate>
        <BenchmarkCard isConnected={isZerodhaConnected} />
      </div>
    </div>
  )
}
