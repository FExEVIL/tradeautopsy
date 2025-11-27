interface Trade {
  id: string
  trade_date: string
  pnl: number | null
  tradingsymbol: string
  created_at?: string
}

export interface BehavioralInsight {
  type: 'critical' | 'warning' | 'success' | 'info'
  title: string
  description: string
  impact: string
  suggestion: string
  data?: any
}

export function analyzeTradingBehavior(trades: Trade[]): BehavioralInsight[] {
  const insights: BehavioralInsight[] = []

  // Sort trades by date
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  )

  // 1. Revenge Trading Detection
  const revengeTrades = detectRevengeTrades(sortedTrades)
  if (revengeTrades.count > 0) {
    insights.push({
      type: 'critical',
      title: 'Revenge Trading Detected',
      description: `You took ${revengeTrades.count} trades within 30 minutes of a loss`,
      impact: `Loss from revenge trades: ₹${revengeTrades.totalLoss.toFixed(2)}`,
      suggestion: 'Wait at least 1 hour after a loss before taking the next trade',
      data: revengeTrades
    })
  } else {
    insights.push({
      type: 'success',
      title: 'No Revenge Trading',
      description: 'You maintained discipline after losses',
      impact: 'Avoided emotional trading',
      suggestion: 'Keep maintaining this discipline'
    })
  }

  // 2. Overtrading Detection
  const overtrading = detectOvertrading(sortedTrades)
  if (overtrading.detected) {
    insights.push({
      type: 'warning',
      title: 'Overtrading Pattern',
      description: `You traded ${overtrading.maxTradesPerDay} times in a single day`,
      impact: `Average P&L on high-volume days: ₹${overtrading.avgPnL.toFixed(2)}`,
      suggestion: 'Limit yourself to 3-5 quality trades per day',
      data: overtrading
    })
  }

  // 3. Time-Based Performance
  const timeAnalysis = analyzeTimePerformance(sortedTrades)
  const bestHour = timeAnalysis.bestHour
  const worstHour = timeAnalysis.worstHour
  
  if (bestHour) {
    insights.push({
      type: 'success',
      title: `Best Trading Time: ${bestHour.hour}`,
      description: `${bestHour.winRate.toFixed(0)}% win rate during this hour`,
      impact: `Average P&L: ₹${bestHour.avgPnL.toFixed(2)}`,
      suggestion: `Focus more trades during ${bestHour.hour}`,
      data: timeAnalysis
    })
  }

  if (worstHour && worstHour.trades > 2) {
    insights.push({
      type: 'warning',
      title: `Avoid Trading at ${worstHour.hour}`,
      description: `${worstHour.winRate.toFixed(0)}% win rate during this hour`,
      impact: `Average loss: ₹${Math.abs(worstHour.avgPnL).toFixed(2)}`,
      suggestion: `Avoid or reduce trades during ${worstHour.hour}`,
      data: timeAnalysis
    })
  }

  // 4. Streak Analysis
  const streaks = analyzeStreaks(sortedTrades)
  if (streaks.longestWinStreak >= 3) {
    insights.push({
      type: 'success',
      title: `${streaks.longestWinStreak}-Trade Win Streak`,
      description: 'You maintained consistency during winning periods',
      impact: `Earned ₹${streaks.winStreakProfit.toFixed(2)} during streak`,
      suggestion: 'Document what you did right during this period',
      data: streaks
    })
  }

  if (streaks.longestLoseStreak >= 3) {
    insights.push({
      type: 'critical',
      title: `${streaks.longestLoseStreak}-Trade Losing Streak`,
      description: 'Multiple consecutive losses detected',
      impact: `Lost ₹${Math.abs(streaks.loseStreakLoss).toFixed(2)} during streak`,
      suggestion: 'Take a break after 2 consecutive losses',
      data: streaks
    })
  }

  return insights
}

function detectRevengeTrades(trades: Trade[]) {
  let revengeCount = 0
  let totalLoss = 0
  const revengeDetails: any[] = []

  for (let i = 1; i < trades.length; i++) {
    const prevTrade = trades[i - 1]
    const currentTrade = trades[i]

    if ((prevTrade.pnl || 0) < 0) {
      const timeDiff = new Date(currentTrade.trade_date).getTime() - new Date(prevTrade.trade_date).getTime()
      const minutesDiff = timeDiff / (1000 * 60)

      if (minutesDiff <= 30) {
        revengeCount++
        if ((currentTrade.pnl || 0) < 0) {
          totalLoss += Math.abs(currentTrade.pnl || 0)
        }
        revengeDetails.push({
          symbol: currentTrade.tradingsymbol,
          minutesAfterLoss: minutesDiff.toFixed(0),
          pnl: currentTrade.pnl
        })
      }
    }
  }

  return { count: revengeCount, totalLoss, details: revengeDetails }
}

function detectOvertrading(trades: Trade[]) {
  const tradesByDay: { [key: string]: Trade[] } = {}
  
  trades.forEach(trade => {
    const date = new Date(trade.trade_date).toDateString()
    if (!tradesByDay[date]) tradesByDay[date] = []
    tradesByDay[date].push(trade)
  })

  const dailyCounts = Object.values(tradesByDay).map(dayTrades => dayTrades.length)
  const maxTradesPerDay = Math.max(...dailyCounts)
  
  const highVolumeDays = Object.entries(tradesByDay).filter(([_, dayTrades]) => dayTrades.length > 5)
  const avgPnL = highVolumeDays.length > 0
    ? highVolumeDays.reduce((sum, [_, dayTrades]) => 
        sum + dayTrades.reduce((s, t) => s + (t.pnl || 0), 0), 0) / highVolumeDays.length
    : 0

  return {
    detected: maxTradesPerDay > 7,
    maxTradesPerDay,
    avgPnL,
    highVolumeDays: highVolumeDays.length
  }
}

function analyzeTimePerformance(trades: Trade[]) {
  const hourlyStats: { [hour: string]: { wins: number; losses: number; totalPnL: number; trades: number } } = {}

  trades.forEach(trade => {
    const hour = new Date(trade.trade_date).getHours()
    const hourLabel = `${hour}:00-${hour + 1}:00`
    
    if (!hourlyStats[hourLabel]) {
      hourlyStats[hourLabel] = { wins: 0, losses: 0, totalPnL: 0, trades: 0 }
    }

    hourlyStats[hourLabel].trades++
    hourlyStats[hourLabel].totalPnL += trade.pnl || 0
    if ((trade.pnl || 0) > 0) hourlyStats[hourLabel].wins++
    else if ((trade.pnl || 0) < 0) hourlyStats[hourLabel].losses++
  })

  const hourlyData = Object.entries(hourlyStats).map(([hour, stats]) => ({
    hour,
    winRate: (stats.wins / stats.trades) * 100,
    avgPnL: stats.totalPnL / stats.trades,
    trades: stats.trades
  }))

  const bestHour = hourlyData.reduce((best, current) => 
    current.avgPnL > (best?.avgPnL || -Infinity) ? current : best, hourlyData[0]
  )

  const worstHour = hourlyData.reduce((worst, current) => 
    current.avgPnL < (worst?.avgPnL || Infinity) ? current : worst, hourlyData[0]
  )

  return { hourlyData, bestHour, worstHour }
}

function analyzeStreaks(trades: Trade[]) {
  let currentWinStreak = 0
  let currentLoseStreak = 0
  let longestWinStreak = 0
  let longestLoseStreak = 0
  let winStreakProfit = 0
  let loseStreakLoss = 0
  let tempWinProfit = 0
  let tempLoseAmount = 0

  trades.forEach(trade => {
    const pnl = trade.pnl || 0
    
    if (pnl > 0) {
      currentWinStreak++
      currentLoseStreak = 0
      tempWinProfit += pnl
      
      if (currentWinStreak > longestWinStreak) {
        longestWinStreak = currentWinStreak
        winStreakProfit = tempWinProfit
      }
    } else if (pnl < 0) {
      currentLoseStreak++
      currentWinStreak = 0
      tempLoseAmount += pnl
      tempWinProfit = 0
      
      if (currentLoseStreak > longestLoseStreak) {
        longestLoseStreak = currentLoseStreak
        loseStreakLoss = tempLoseAmount
      }
    }
  })

  return { longestWinStreak, longestLoseStreak, winStreakProfit, loseStreakLoss }
}
