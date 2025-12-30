import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import ChartsWrapper from './ChartsWrapper'

function safeParseFloat(value: any): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  if (typeof value === 'string') {
    const cleaned = value.replace(/[₹,]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

export default async function ChartsPage() {
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

  const { data: rawTrades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', effectiveUserId)
    .order('trade_date', { ascending: true }) 

  const trades = (rawTrades || []).map(t => ({
    ...t,
    pnl: safeParseFloat(t.pnl),
    dateObj: t.trade_date ? new Date(t.trade_date) : new Date()
  }))

  // --- Calculate Metrics ---
  let cumulativePnL = 0
  let maxEquity = -Infinity
  const equityCurve: any[] = []
  const dailyPnLMap: { [date: string]: number } = {}

  trades.forEach(t => {
    const pnl = t.pnl
    cumulativePnL += pnl
    
    if (cumulativePnL > maxEquity) maxEquity = cumulativePnL

    const dateKey = t.dateObj.toISOString().split('T')[0]
    dailyPnLMap[dateKey] = (dailyPnLMap[dateKey] || 0) + pnl

    equityCurve.push({
      date: t.dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      equity: cumulativePnL,
      rawDate: t.dateObj.getTime()
    })
  })

  const metrics = {
    totalPnL: cumulativePnL,
    peakPnL: maxEquity,
    winRate: trades.length > 0 
      ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 
      : 0,
    equityCurve,
    dailyPnL: dailyPnLMap
  }

  return <ChartsWrapper trades={trades as any[]} metrics={metrics} />
}
