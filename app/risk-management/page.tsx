import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { RiskManagementClient } from './RiskManagementClient'
import { getCurrentProfileId } from '@/lib/profile-utils'
import {
  calculateMaxDrawdown,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateDailyReturns,
} from '@/lib/risk-calculations'
import { calculateAvgProfit, calculateAvgLoss } from '@/lib/calculations'

export default async function RiskManagementPage() {
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
  const profileId = effectiveUserId ? await getCurrentProfileId(effectiveUserId) : workosProfileId

  // Fetch all trades (filter by profile)
  let tradesQuery = supabase
    .from('trades')
    .select('*')
    .eq('user_id', effectiveUserId)
    .is('deleted_at', null)
  
  if (profileId) {
    tradesQuery = tradesQuery.eq('profile_id', profileId)
  }
  
  const { data: trades } = await tradesQuery.order('trade_date', { ascending: true })

  // Calculate risk metrics from real trades
  let riskMetrics = {
    maxDrawdown: 0,
    sharpeRatio: 0,
    sortinoRatio: 0,
    winRate: 0,
    avgWin: 0,
    avgLoss: 0,
    totalTrades: 0,
    totalPnL: 0,
    currentDrawdown: 0,
  }

  if (trades && trades.length > 0) {
    const tradesWithPnL = trades.map(t => ({
      ...t,
      pnl: typeof t.pnl === 'string' ? parseFloat(t.pnl) : (t.pnl || 0),
    }))

    const dailyReturns = calculateDailyReturns(tradesWithPnL as any)
    const maxDrawdown = calculateMaxDrawdown(tradesWithPnL as any)
    const sharpeRatio = calculateSharpeRatio(dailyReturns)
    const sortinoRatio = calculateSortinoRatio(dailyReturns)
    const avgWin = calculateAvgProfit(tradesWithPnL as any)
    const avgLoss = calculateAvgLoss(tradesWithPnL as any)
    const wins = tradesWithPnL.filter(t => t.pnl > 0)
    const winRate = (wins.length / tradesWithPnL.length) * 100
    const totalPnL = tradesWithPnL.reduce((sum, t) => sum + t.pnl, 0)

    // Calculate current drawdown (from peak)
    let peak = 0
    let currentDrawdown = 0
    let runningTotal = 0
    for (const trade of tradesWithPnL) {
      runningTotal += trade.pnl
      if (runningTotal > peak) {
        peak = runningTotal
      }
      const drawdown = peak - runningTotal
      if (drawdown > currentDrawdown) {
        currentDrawdown = drawdown
      }
    }

    riskMetrics = {
      maxDrawdown,
      sharpeRatio,
      sortinoRatio,
      winRate,
      avgWin,
      avgLoss: Math.abs(avgLoss),
      totalTrades: tradesWithPnL.length,
      totalPnL,
      currentDrawdown,
    }
  }

  // Get account size from profile or use default
  const { data: profile } = profileId 
    ? await supabase.from('profiles').select('account_size').eq('id', profileId).single()
    : { data: null }
  
  const accountSize = profile?.account_size || 100000

  // Calculate today's P&L for daily loss tracking
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  
  const { data: todayTrades } = trades && trades.length > 0
    ? await supabase
        .from('trades')
        .select('pnl')
        .eq('user_id', effectiveUserId)
        .gte('trade_date', todayStr)
        .is('deleted_at', null)
    : { data: [] }

  const dailyPnL = todayTrades?.reduce((sum, t) => {
    const pnl = typeof t.pnl === 'string' ? parseFloat(t.pnl) : (t.pnl || 0)
    return sum + pnl
  }, 0) || 0

  return (
    <RiskManagementClient 
      trades={trades || []} 
      riskMetrics={riskMetrics} 
      accountSize={accountSize}
      dailyPnL={dailyPnL}
    />
  )
}
