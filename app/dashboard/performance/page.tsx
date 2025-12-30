import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import PerformanceClient from './PerformanceClient'
import { calculateAvgProfit, calculateAvgLoss, calculateRiskRewardRatio } from '@/lib/calculations'

// Helper to safely parse numbers (handles "₹1,200", "1,200.50", strings, etc.)
function safeParseFloat(value: any): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[₹,]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

// Helper to safely parse dates
function safeParseDate(value: any): Date | null {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

export default async function PerformancePage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  // Check Supabase auth
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check WorkOS auth (fallback)
  const workosUserId = cookieStore.get('workos_user_id')?.value
  const workosProfileId = cookieStore.get('workos_profile_id')?.value || cookieStore.get('active_profile_id')?.value
  
  // Must have either Supabase user OR WorkOS session
  if (!user && !workosUserId) {
    redirect('/login')
  }
  
  // Use effective user ID for queries
  const effectiveUserId = user?.id || workosProfileId

  // Get current profile
  const { getCurrentProfileId } = await import('@/lib/profile-utils')
  const profileId = effectiveUserId ? await getCurrentProfileId(effectiveUserId) : workosProfileId

  // Fetch raw data - we will cast it manually (filter by profile)
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', effectiveUserId)
    .is('deleted_at', null)
  
  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }
  
  const { data: rawTrades } = await tradesQuery.order('trade_date', { ascending: true }) 

  // 1. Check if we even got rows
  if (!rawTrades || rawTrades.length === 0) {
    // Pass empty array -> Client component will show "No Data" UI (Correct)
    return <PerformanceClient trades={[]} metrics={getEmptyMetrics()} />
  }

  // 2. Robustly parse every trade
  const trades = rawTrades.map(t => ({
    ...t,
    // Force PnL to be a number
    pnl: safeParseFloat(t.pnl),
    // Keep date object valid
    dateObj: safeParseDate(t.trade_date) || new Date() 
  }))

  // --- SERVER-SIDE METRIC CALCULATION ---
  let cumulativePnL = 0
  let maxEquity = -Infinity
  let maxDrawdown = 0
  let totalWins = 0
  let totalLosses = 0
  let grossProfit = 0
  let grossLoss = 0

  // Aggregate daily P&L for heatmap
  const dailyPnLMap: { [date: string]: number } = {}

  const equityCurve = trades.map(t => {
    const pnl = t.pnl
    cumulativePnL += pnl
    
    // Drawdown
    if (cumulativePnL > maxEquity) maxEquity = cumulativePnL
    const dd = maxEquity - cumulativePnL
    if (dd > maxDrawdown) maxDrawdown = dd

    // Win/Loss
    if (pnl > 0) {
      totalWins++
      grossProfit += pnl
    } else if (pnl < 0) {
      totalLosses++
      grossLoss += Math.abs(pnl)
    }

    // Heatmap Aggregation
    const dateKey = t.dateObj.toISOString().split('T')[0]
    dailyPnLMap[dateKey] = (dailyPnLMap[dateKey] || 0) + pnl

    return {
      date: t.dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      equity: cumulativePnL
    }
  })

  // Edge case: If calculation resulted in basically nothing, fallback
  if (cumulativePnL === 0 && totalWins === 0 && totalLosses === 0) {
     // This might happen if all PnL values were 0 or unparseable
  }

  if (trades.length === 0) maxEquity = 0

  // Use shared calculation utilities
  const avgWin = calculateAvgProfit(trades)
  const avgLoss = calculateAvgLoss(trades)
  const riskRewardRatio = calculateRiskRewardRatio(trades)

  const metrics = {
    totalTrades: trades.length,
    totalPnL: cumulativePnL,
    winRate: trades.length > 0 ? (totalWins / trades.length) * 100 : 0,
    avgWin,
    avgLoss: -avgLoss, // Keep negative for display
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999 : 0),
    riskRewardRatio,
    maxDrawdown: maxDrawdown,
    equityCurve,
    dailyPnL: dailyPnLMap
  }

  // Cast trades back to generic array for client prop
  return <PerformanceClient trades={rawTrades as any[]} metrics={metrics} />
}

function getEmptyMetrics() {
  return {
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0,
    riskRewardRatio: 0,
    maxDrawdown: 0,
    equityCurve: [],
    dailyPnL: {}
  }
}
