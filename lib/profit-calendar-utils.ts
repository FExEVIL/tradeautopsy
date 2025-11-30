import { Trade } from '@/types/trade'

export type ProfitCalendarDay = {
  date: string
  pnl: number
  pnlPercent: number
  trades: Trade[]
  winRate: number
  tradeCount: number
}

export function aggregateTradesByDay(trades: Trade[]): Record<string, ProfitCalendarDay> {
  const dayMap: Record<string, ProfitCalendarDay> = {}

  trades.forEach((trade) => {
    if (!trade.trade_date) return
    const date = new Date(trade.trade_date)
    if (Number.isNaN(date.getTime())) return

    const key = date.toISOString().split('T')[0]

    if (!dayMap[key]) {
      dayMap[key] = {
        date: key,
        pnl: 0,
        pnlPercent: 0,
        trades: [],
        winRate: 0,
        tradeCount: 0,
      }
    }

    const day = dayMap[key]
    day.pnl += trade.pnl || 0
    day.trades.push(trade)
    day.tradeCount += 1
  })

  Object.values(dayMap).forEach((day) => {
    const wins = day.trades.filter((t) => (t.pnl || 0) > 0).length
    day.winRate = day.tradeCount > 0 ? (wins / day.tradeCount) * 100 : 0

    const avgNotional = day.trades.reduce((sum, t) => {
      const price = t.average_price || 0
      const qty = t.quantity || 0
      return sum + price * qty
    }, 0) / (day.tradeCount || 1)

    day.pnlPercent = avgNotional > 0 ? (day.pnl / (avgNotional * day.tradeCount)) * 100 : 0
  })

  return dayMap
}

export function getPnlColorClass(pnlPercent: number): string {
  if (pnlPercent >= 5) return 'bg-emerald-500'
  if (pnlPercent >= 1) return 'bg-emerald-400/70'
  if (pnlPercent > -1 && pnlPercent < 1) return 'bg-neutral-700'
  if (pnlPercent <= -5) return 'bg-red-500'
  if (pnlPercent < -1) return 'bg-red-400/70'
  return 'bg-neutral-800'
}

export function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const firstWeekday = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const weeks: (number | null)[][] = []
  let currentDay = 1

  while (currentDay <= daysInMonth) {
    const week: (number | null)[] = []
    for (let i = 0; i < 7; i++) {
      if (weeks.length === 0 && i < firstWeekday) {
        week.push(null)
      } else if (currentDay > daysInMonth) {
        week.push(null)
      } else {
        week.push(currentDay)
        currentDay++
      }
    }
    weeks.push(week)
  }

  return weeks
}

export function formatMonthYear(date: Date) {
  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}
