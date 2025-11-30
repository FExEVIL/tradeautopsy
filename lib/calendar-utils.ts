import { Trade } from '@/types/trade'

export interface DayPnL {
  date: string
  pnl: number
  trades: Trade[]
  count: number
}

export function aggregateTradesByDay(trades: Trade[]): DayPnL[] {
  const dayMap = new Map<string, DayPnL>()

  trades.forEach((trade) => {
    const date = new Date(trade.trade_date).toISOString().split('T')[0]
    
    if (!dayMap.has(date)) {
      dayMap.set(date, {
        date,
        pnl: 0,
        trades: [],
        count: 0,
      })
    }

    const day = dayMap.get(date)!
    day.pnl += trade.pnl || 0
    day.trades.push(trade)
    day.count++
  })

  return Array.from(dayMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

export function getColorClass(pnl: number): string {
  if (pnl === 0) return 'color-empty'
  if (pnl > 0) {
    if (pnl >= 5000) return 'color-profit-4'
    if (pnl >= 2000) return 'color-profit-3'
    if (pnl >= 500) return 'color-profit-2'
    return 'color-profit-1'
  } else {
    if (pnl <= -5000) return 'color-loss-4'
    if (pnl <= -2000) return 'color-loss-3'
    if (pnl <= -500) return 'color-loss-2'
    return 'color-loss-1'
  }
}
