/**
 * Comprehensive Mock Trading Data Generator for TradeAutopsy
 * Generates realistic trading data with behavioral patterns for testing all features
 */

export interface MockTrade {
  // Core fields
  user_id: string
  tradingsymbol: string
  transaction_type: 'BUY' | 'SELL'
  quantity: number
  average_price: number
  entry_price: number
  exit_price: number
  trade_date: string
  pnl: number
  product: 'MIS' | 'CNC' | 'NRML'
  status: string
  trade_id?: string

  // Journal fields
  notes?: string
  journal_note?: string // Alternative field name used in some parts of the app
  tags?: string[]
  journal_tags?: string[] // Alternative field name used in some parts of the app
  emotion?: 'Revenge' | 'Fear' | 'Calm' | 'Greedy' | 'Disciplined'
  rating?: number
  setup_type?: string
  setup?: string
  mistakes?: string[]
  execution_rating?: number
  strategy?: string
}

interface PatternState {
  consecutiveLosses: number
  consecutiveWins: number
  dailyTradeCount: Map<string, number>
  dailyPnL: Map<string, number>
  lastTradeTime: Date | null
  lastTradePnL: number
  avgPositionSize: number
  positionSizeHistory: number[]
}

export class TradingDataGenerator {
  private startDate: Date
  private endDate: Date
  private state: PatternState
  private seed: number

  // Indian market symbols with realistic base prices
  private readonly SYMBOLS = {
    'NIFTY': { basePrice: 21500, lotSize: 50 },
    'BANKNIFTY': { basePrice: 48000, lotSize: 15 },
    'RELIANCE': { basePrice: 2450, lotSize: 1 },
    'TCS': { basePrice: 3850, lotSize: 1 },
    'INFY': { basePrice: 1520, lotSize: 1 },
    'HDFCBANK': { basePrice: 1650, lotSize: 1 },
    'ICICIBANK': { basePrice: 1050, lotSize: 1 },
    'SBIN': { basePrice: 680, lotSize: 1 },
    'WIPRO': { basePrice: 420, lotSize: 1 },
    'LT': { basePrice: 3850, lotSize: 1 }
  }

  private readonly SETUPS = [
    'Bull Flag', 'Opening Range Breakout', 'VWAP Bounce', 'Support/Resistance',
    'Momentum', 'Scalp', 'Breakout', 'Breakdown', 'Reversal', 'Pullback',
    'Range-bound', 'Gap-up', 'Gap-down', 'Uncategorized'
  ]

  private readonly MISTAKES = [
    'FOMO', 'Revenge Trading', 'Wide Stop', 'No Plan', 'Overtrading',
    'Poor Entry', 'Early Exit', 'Held Too Long', 'No Stop Loss'
  ]

  private readonly EMOTIONS: Array<'Revenge' | 'Fear' | 'Calm' | 'Greedy' | 'Disciplined'> = [
    'Revenge', 'Fear', 'Calm', 'Greedy', 'Disciplined'
  ]

  constructor(seed: number = 12345) {
    this.seed = seed
    this.endDate = new Date('2024-12-03')
    this.startDate = new Date(this.endDate)
    this.startDate.setMonth(this.startDate.getMonth() - 6) // 6 months of data

    this.state = {
      consecutiveLosses: 0,
      consecutiveWins: 0,
      dailyTradeCount: new Map(),
      dailyPnL: new Map(),
      lastTradeTime: null,
      lastTradePnL: 0,
      avgPositionSize: 50,
      positionSizeHistory: []
    }
  }

  /**
   * Seeded random number generator for reproducibility
   */
  private random(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  /**
   * Get symbol price with realistic variation
   */
  private getSymbolPrice(symbol: string): number {
    const symbolData = this.SYMBOLS[symbol as keyof typeof this.SYMBOLS]
    if (!symbolData) return 1000

    // Add realistic daily variation (±2%)
    const variation = (this.random() - 0.5) * 0.04
    return symbolData.basePrice * (1 + variation)
  }

  /**
   * Get lot size for symbol
   */
  private getLotSize(symbol: string): number {
    const symbolData = this.SYMBOLS[symbol as keyof typeof this.SYMBOLS]
    return symbolData?.lotSize || 1
  }

  /**
   * Generate realistic trade with pattern logic
   */
  private generateTrade(date: Date, forcePattern?: string): MockTrade {
    const symbols = Object.keys(this.SYMBOLS)
    const symbol = symbols[Math.floor(this.random() * symbols.length)]
    const basePrice = this.getSymbolPrice(symbol)
    const lotSize = this.getLotSize(symbol)

    // Base quantity (1-3 lots for indices, 50-200 shares for stocks)
    let quantity = symbol.includes('NIFTY')
      ? lotSize * (Math.floor(this.random() * 3) + 1)
      : lotSize * (Math.floor(this.random() * 150) + 50)

    // Determine if this will be a win or loss
    let willWin = this.random() > 0.45 // 55% win rate baseline

    // PATTERN 1: Revenge Trading (after losses, quick trade, usually loses)
    if (forcePattern === 'revenge' || (this.state.consecutiveLosses >= 2 && this.random() > 0.4)) {
      quantity *= 2.2 // Double+ position size
      willWin = this.random() > 0.75 // 75% chance of loss
      const timeSinceLastLoss = this.state.lastTradeTime
        ? (date.getTime() - this.state.lastTradeTime.getTime()) / (1000 * 60) // minutes
        : 60

      if (timeSinceLastLoss < 30) {
        // Very quick revenge trade
        willWin = this.random() > 0.85 // 85% loss rate
      }
    }

    // PATTERN 2: Win Streak Overconfidence (after 4+ wins, increase size, then lose)
    if (forcePattern === 'overconfident' || (this.state.consecutiveWins >= 4 && this.random() > 0.5)) {
      quantity *= 1.8
      willWin = this.random() > 0.65 // 65% chance of loss after overconfidence
    }

    // PATTERN 3: Time-based patterns
    const hour = date.getHours()
    if (hour >= 14 && hour < 15) {
      // 2-3 PM: Poor performance (40% win rate)
      willWin = this.random() > 0.6
    } else if (hour >= 9 && hour < 11) {
      // 9-11 AM: Good performance (70% win rate)
      willWin = this.random() > 0.3
    }

    // PATTERN 4: Overtrading day (lower quality trades)
    const dateKey = date.toISOString().split('T')[0]
    const dailyCount = this.state.dailyTradeCount.get(dateKey) || 0
    if (dailyCount >= 8) {
      willWin = this.random() > 0.55 // 45% win rate on overtrading days
    }

    // Calculate P&L
    const pnlPercent = willWin
      ? (0.5 + this.random() * 1.5) / 100 // 0.5% to 2% profit
      : -(0.5 + this.random() * 2.0) / 100 // -0.5% to -2.5% loss

    const entryPrice = basePrice * (1 + (this.random() - 0.5) * 0.01) // ±0.5% entry variation
    const exitPrice = entryPrice * (1 + pnlPercent)
    const pnl = (exitPrice - entryPrice) * quantity

    // Update state
    if (pnl > 0) {
      this.state.consecutiveWins++
      this.state.consecutiveLosses = 0
    } else {
      this.state.consecutiveLosses++
      this.state.consecutiveWins = 0
    }

    this.state.lastTradeTime = date
    this.state.lastTradePnL = pnl
    this.state.positionSizeHistory.push(quantity)
    if (this.state.positionSizeHistory.length > 10) {
      this.state.positionSizeHistory.shift()
    }
    this.state.avgPositionSize = this.state.positionSizeHistory.reduce((a, b) => a + b, 0) / this.state.positionSizeHistory.length

    const dailyPnL = this.state.dailyPnL.get(dateKey) || 0
    this.state.dailyPnL.set(dateKey, dailyPnL + pnl)
    this.state.dailyTradeCount.set(dateKey, dailyCount + 1)

    // Generate journal fields
    const setup = this.SETUPS[Math.floor(this.random() * this.SETUPS.length)]
    const isJournaled = this.random() > 0.35 // 65% journaled
    const rating = isJournaled ? Math.floor(this.random() * 3) + 3 : undefined // 3-5 stars
    const emotion = isJournaled && pnl < 0 && this.state.consecutiveLosses >= 2
      ? 'Revenge'
      : isJournaled && pnl > 0 && this.state.consecutiveWins >= 3
        ? 'Greedy'
        : isJournaled
          ? (this.EMOTIONS[Math.floor(this.random() * 3) + 2]) // Calm, Greedy, or Disciplined
          : undefined

    const mistakes: string[] = []
    if (pnl < -500 && isJournaled) {
      if (this.state.consecutiveLosses >= 2) mistakes.push('Revenge Trading')
      if (dailyCount >= 8) mistakes.push('Overtrading')
      if (hour >= 14) mistakes.push('Poor Entry')
      if (Math.abs(pnl) > 2000) mistakes.push('Wide Stop')
    }

    const tags: string[] = [setup.toLowerCase().replace(/\s+/g, '_')]
    if (pnl > 0) tags.push('winner')
    else if (pnl < -100) tags.push('loser')
    else tags.push('scratch')

    if (mistakes.length > 0) {
      tags.push(...mistakes.map(m => m.toLowerCase().replace(/\s+/g, '_')))
    }

    const notes = this.generateNotes(pnl, setup, mistakes, emotion)

    // Determine product type
    const productRand = this.random()
    const product: 'MIS' | 'CNC' | 'NRML' = productRand < 0.7 ? 'MIS' : productRand < 0.9 ? 'CNC' : 'NRML'

    // Determine transaction type (BUY/SELL)
    const transactionType: 'BUY' | 'SELL' = this.random() > 0.5 ? 'BUY' : 'SELL'

    return {
      user_id: '', // Will be set by seed script
      tradingsymbol: symbol,
      transaction_type: transactionType,
      quantity: Math.round(quantity),
      average_price: parseFloat(entryPrice.toFixed(2)),
      entry_price: parseFloat(entryPrice.toFixed(2)),
      exit_price: parseFloat(exitPrice.toFixed(2)),
      trade_date: date.toISOString(),
      pnl: parseFloat(pnl.toFixed(2)),
      product,
      status: 'completed',
      trade_id: `MOCK_${Date.now()}_${Math.floor(this.random() * 10000)}`,
      notes: isJournaled ? notes : undefined,
      journal_note: isJournaled ? notes : undefined, // Alternative field name
      tags: isJournaled ? tags : undefined,
      journal_tags: isJournaled ? tags : undefined, // Alternative field name
      emotion: isJournaled ? emotion : undefined,
      rating: isJournaled ? rating : undefined,
      setup_type: isJournaled ? setup : undefined,
      setup: isJournaled ? setup : undefined,
      mistakes: isJournaled && mistakes.length > 0 ? mistakes : undefined,
      execution_rating: isJournaled ? rating : undefined,
      strategy: setup
    }
  }

  /**
   * Generate realistic trader notes
   */
  private generateNotes(pnl: number, setup: string, mistakes: string[], emotion?: string): string {
    const winNotes = [
      `Clean ${setup} setup, followed plan perfectly. Entry was precise and exit at target.`,
      `${setup} pattern worked well. Managed risk properly with tight stop loss.`,
      `Entered on ${setup} confirmation, exited at first target. Good execution.`,
      `Price action ${setup} setup. Waited for confirmation before entry.`,
      `${setup} trade, followed my rules. Cut losses quickly when needed.`
    ]

    const lossNotes = [
      `Impulsive ${setup} trade. Should have waited for better confirmation.`,
      `Overtraded on ${setup}. Need to improve discipline and wait for A+ setups only.`,
      `Missed stop loss on ${setup} trade. Let it run against me instead of cutting quickly.`,
      `${setup} setup but entered too early. Need to wait for proper confirmation.`,
      `Revenge trade after previous loss. ${setup} wasn't the best setup.`
    ]

    if (pnl > 0) {
      return winNotes[Math.floor(this.random() * winNotes.length)]
    } else {
      let note = lossNotes[Math.floor(this.random() * lossNotes.length)]
      if (mistakes.length > 0) {
        note += ` Mistakes: ${mistakes.join(', ')}.`
      }
      if (emotion === 'Revenge') {
        note += ' Emotional trading detected.'
      }
      return note
    }
  }

  /**
   * Generate time-based trade distribution
   */
  private generateTradeTime(date: Date): Date {
    const hourRand = this.random()
    let hour: number
    let minute: number

    if (hourRand < 0.4) {
      // Morning trades (9:30-11:00) - 40% of trades
      hour = 9 + Math.floor(this.random() * 2)
      minute = hour === 9 ? 30 + Math.floor(this.random() * 30) : Math.floor(this.random() * 60)
    } else if (hourRand < 0.7) {
      // Mid-day (11:00-14:00) - 30% of trades
      hour = 11 + Math.floor(this.random() * 3)
      minute = Math.floor(this.random() * 60)
    } else if (hourRand < 0.9) {
      // Afternoon (14:00-15:00) - 20% of trades (poor performance)
      hour = 14
      minute = Math.floor(this.random() * 60)
    } else {
      // Late (15:00-15:30) - 10% of trades
      hour = 15
      minute = Math.floor(this.random() * 30)
    }

    date.setHours(hour, minute, Math.floor(this.random() * 60))
    return date
  }

  /**
   * Generate all trades with patterns
   */
  public generateAllTrades(userId: string, count: number = 300): MockTrade[] {
    const trades: MockTrade[] = []
    const currentDate = new Date(this.startDate)

    // Reset state
    this.state = {
      consecutiveLosses: 0,
      consecutiveWins: 0,
      dailyTradeCount: new Map(),
      dailyPnL: new Map(),
      lastTradeTime: null,
      lastTradePnL: 0,
      avgPositionSize: 50,
      positionSizeHistory: []
    }

    let tradesGenerated = 0

    while (currentDate <= this.endDate && tradesGenerated < count) {
      // Skip weekends
      const dayOfWeek = currentDate.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }

      const dateKey = currentDate.toISOString().split('T')[0]
      const dailyCount = this.state.dailyTradeCount.get(dateKey) || 0

      // Determine trades for this day
      let tradesToday = 0

      // Occasionally create overtrading days (8-12 trades)
      if (this.random() < 0.08) {
        tradesToday = 8 + Math.floor(this.random() * 5) // 8-12 trades
      } else {
        // Normal day: 0-6 trades
        tradesToday = Math.floor(this.random() * 7)
      }

      // Ensure we don't exceed count
      if (tradesGenerated + tradesToday > count) {
        tradesToday = count - tradesGenerated
      }

      // Generate trades for this day
      for (let i = 0; i < tradesToday; i++) {
        const tradeDate = this.generateTradeTime(new Date(currentDate))

        // Force patterns occasionally
        let forcePattern: string | undefined
        if (this.state.consecutiveLosses >= 2 && this.random() > 0.6) {
          forcePattern = 'revenge'
        } else if (this.state.consecutiveWins >= 4 && this.random() > 0.7) {
          forcePattern = 'overconfident'
        }

        const trade = this.generateTrade(tradeDate, forcePattern)
        trade.user_id = userId
        trades.push(trade)
        tradesGenerated++

        // Small delay between trades on same day (5-60 minutes)
        if (i < tradesToday - 1) {
          tradeDate.setMinutes(tradeDate.getMinutes() + 5 + Math.floor(this.random() * 55))
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Sort by trade_date
    trades.sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime())

    return trades
  }

  /**
   * Get statistics about generated data
   */
  public getStatistics(trades: MockTrade[]) {
    const winners = trades.filter(t => t.pnl > 0)
    const losers = trades.filter(t => t.pnl < 0)
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
    const avgWin = winners.length > 0 ? winners.reduce((sum, t) => sum + t.pnl, 0) / winners.length : 0
    const avgLoss = losers.length > 0 ? losers.reduce((sum, t) => sum + t.pnl, 0) / losers.length : 0
    const winRate = trades.length > 0 ? (winners.length / trades.length) * 100 : 0

    // Pattern detection
    const revengeTrades = trades.filter((t, i) => {
      if (i === 0) return false
      const prev = trades[i - 1]
      const timeDiff = new Date(t.trade_date).getTime() - new Date(prev.trade_date).getTime()
      return prev.pnl < 0 && timeDiff < 30 * 60 * 1000 && t.quantity > prev.quantity * 1.5
    })

    const overtradingDays = Array.from(this.state.dailyTradeCount.values()).filter(count => count >= 8).length

    return {
      totalTrades: trades.length,
      winners: winners.length,
      losers: losers.length,
      winRate: parseFloat(winRate.toFixed(2)),
      totalPnL: parseFloat(totalPnL.toFixed(2)),
      avgWin: parseFloat(avgWin.toFixed(2)),
      avgLoss: parseFloat(avgLoss.toFixed(2)),
      maxWin: Math.max(...trades.map(t => t.pnl), 0),
      maxLoss: Math.min(...trades.map(t => t.pnl), 0),
      revengeTrades: revengeTrades.length,
      overtradingDays,
      dateRange: {
        start: trades[0]?.trade_date,
        end: trades[trades.length - 1]?.trade_date
      }
    }
  }
}

/**
 * Export function for easy use
 */
export function generateMockTrades(userId: string, count: number = 300, seed: number = 12345): MockTrade[] {
  const generator = new TradingDataGenerator(seed)
  return generator.generateAllTrades(userId, count)
}

/**
 * Export statistics function
 */
export function getTradeStatistics(trades: MockTrade[]) {
  const generator = new TradingDataGenerator()
  return generator.getStatistics(trades)
}

