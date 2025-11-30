import { Trade } from '@/types/trade'

export interface DashboardStats {
  thisWeek: { pnl: number; trades: number; winRate: number }
  thisMonth: { pnl: number; trades: number; winRate: number }
  allTime: { pnl: number; trades: number; winRate: number }
  journaledCount: number
  totalCount: number
  monthlyData: { month: string; pnl: number }[]
  recentTrades: Trade[]
}

export function calculateDashboardStats(trades: Trade[]): DashboardStats {
  const now = new Date()
const startOfWeek = new Date(now)
startOfWeek.setDate(now.getDate() - 7) // Last 7 days
startOfWeek.setHours(0, 0, 0, 0)


  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Filter trades
  const thisWeekTrades = trades.filter(
    (t) => new Date(t.trade_date) >= startOfWeek
  )
  const thisMonthTrades = trades.filter(
    (t) => new Date(t.trade_date) >= startOfMonth
  )

  // Calculate stats helper
  const calcStats = (tradeList: Trade[]) => {
    const totalPnl = tradeList.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const winningTrades = tradeList.filter((t) => (t.pnl || 0) > 0).length
    const winRate = tradeList.length > 0 ? (winningTrades / tradeList.length) * 100 : 0
    return { pnl: totalPnl, trades: tradeList.length, winRate }
  }

 // Monthly data for chart (last 6 months from latest trade)
const allTradeDates = trades.map(t => new Date(t.trade_date).getTime()).filter(d => !isNaN(d))
const latestTradeDate = allTradeDates.length > 0 
  ? new Date(Math.max(...allTradeDates))
  : new Date()

const monthlyData = Array.from({ length: 6 }, (_, i) => {
  const monthStart = new Date(latestTradeDate.getFullYear(), latestTradeDate.getMonth() - (5 - i), 1)
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
  
  const monthTrades = trades.filter((t) => {
    const tradeDate = new Date(t.trade_date)
    return tradeDate >= monthStart && tradeDate <= monthEnd
  })
  
  const pnl = monthTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  
  return {
    month: monthStart.toLocaleDateString('en-IN', { month: 'short' }),
    pnl: Math.round(pnl),
  }
})


  // Recent trades (last 5)
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()
  )
  const recentTrades = sortedTrades.slice(0, 5)

  const journaledCount = trades.filter((t) => t.journal_note || t.journal_tags?.length).length

  return {
    thisWeek: calcStats(thisWeekTrades),
    thisMonth: calcStats(thisMonthTrades),
    allTime: calcStats(trades),
    journaledCount,
    totalCount: trades.length,
    monthlyData,
    recentTrades,
  }
}
