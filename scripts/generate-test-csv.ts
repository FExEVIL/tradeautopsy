/**
 * Comprehensive 1-Year Trading CSV Generator for TradeAutopsy
 * Generates realistic trading data with ALL patterns and features for complete testing
 * 
 * Usage: npx tsx scripts/generate-test-csv.ts
 */

import fs from 'fs'
import path from 'path'

interface Trade {
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
  strategy?: string
  setup?: string
  notes?: string
  tags?: string
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
  revengeTrades: number
  fomoTrades: number
  overtradingDays: Set<string>
  overconfidentTrades: number
  lossAversionTrades: number
  weekendWarriorTrades: number
  revengeSizingTrades: number
  newsTrades: number
  timeViolations: number
  tradeCountViolations: number
  lossLimitViolations: number
}

class TradeDataGenerator {
  private trades: Trade[] = []
  private state: PatternState
  private seed: number
  private startDate: Date
  private endDate: Date

  // Indian market symbols with realistic base prices
  private readonly SYMBOLS = {
    'NIFTY': { basePrice: 21500, lotSize: 50, type: 'index' },
    'BANKNIFTY': { basePrice: 48000, lotSize: 15, type: 'index' },
    'RELIANCE': { basePrice: 2450, lotSize: 1, type: 'stock' },
    'TCS': { basePrice: 3850, lotSize: 1, type: 'stock' },
    'INFY': { basePrice: 1520, lotSize: 1, type: 'stock' },
    'HDFCBANK': { basePrice: 1650, lotSize: 1, type: 'stock' },
    'ICICIBANK': { basePrice: 950, lotSize: 1, type: 'stock' },
    'SBIN': { basePrice: 620, lotSize: 1, type: 'stock' },
    'ITC': { basePrice: 425, lotSize: 1, type: 'stock' },
    'NIFTY 24000 CE': { basePrice: 150, lotSize: 50, type: 'option' },
    'NIFTY 24000 PE': { basePrice: 120, lotSize: 50, type: 'option' },
    'BANKNIFTY 48000 CE': { basePrice: 300, lotSize: 15, type: 'option' },
    'BANKNIFTY 48000 PE': { basePrice: 280, lotSize: 15, type: 'option' }
  }

  private readonly STRATEGIES = ['scalping', 'intraday', 'swing', 'positional', 'options']
  private readonly SETUPS = ['breakout', 'breakdown', 'reversal', 'pullback', 'range-bound', 'gap-up', 'gap-down']
  private readonly BROKERS = ['Zerodha', 'Upstox', 'AngelOne', 'ICICI Direct']
  private readonly PROFILES = ['F&O', 'Equity', 'Options', 'Swing']

  // Strategy performance configs
  private readonly STRATEGY_CONFIGS = {
    scalping: { winRate: 0.58, avgWinner: 450, avgLoser: 380, weight: 0.40 },
    intraday: { winRate: 0.52, avgWinner: 850, avgLoser: 720, weight: 0.30 },
    swing: { winRate: 0.48, avgWinner: 3200, avgLoser: 2800, weight: 0.20 },
    options: { winRate: 0.45, avgWinner: 5500, avgLoser: 4200, weight: 0.10 }
  }

  // Time-based performance (hour -> win rate multiplier)
  private readonly TIME_PERFORMANCE = {
    '9-11': 0.65,   // 9:30 AM - 11:30 AM: Best time
    '11-13': 0.52,  // 11:30 AM - 1:00 PM
    '13-14': 0.38,  // 1:00 PM - 2:30 PM: Worst time
    '14-15': 0.42   // 2:30 PM - 3:30 PM
  }

  // Day of week performance
  private readonly DAY_PERFORMANCE = {
    1: 0.58, // Monday
    2: 0.55, // Tuesday
    3: 0.50, // Wednesday
    4: 0.48, // Thursday
    5: 0.42  // Friday (worst)
  }

  constructor(seed: number = 12345) {
    this.seed = seed
    this.endDate = new Date()
    this.startDate = new Date(this.endDate)
    this.startDate.setFullYear(this.startDate.getFullYear() - 1)

    this.state = {
      consecutiveLosses: 0,
      consecutiveWins: 0,
      dailyTradeCount: new Map(),
      dailyPnL: new Map(),
      lastTradeTime: null,
      lastTradePnL: 0,
      avgPositionSize: 50,
      positionSizeHistory: [],
      revengeTrades: 0,
      fomoTrades: 0,
      overtradingDays: new Set(),
      overconfidentTrades: 0,
      lossAversionTrades: 0,
      weekendWarriorTrades: 0,
      revengeSizingTrades: 0,
      newsTrades: 0,
      timeViolations: 0,
      tradeCountViolations: 0,
      lossLimitViolations: 0
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
   * Check if date is a trading day (Mon-Fri, exclude some holidays)
   */
  private isTradingDay(date: Date): boolean {
    const day = date.getDay()
    if (day === 0 || day === 6) return false // Weekend

    // Exclude some major Indian market holidays (simplified)
    const month = date.getMonth()
    const dayOfMonth = date.getDate()
    
    // Republic Day (Jan 26), Independence Day (Aug 15), Diwali (varies), etc.
    if ((month === 0 && dayOfMonth === 26) || // Jan 26
        (month === 7 && dayOfMonth === 15)) {   // Aug 15
      return false
    }

    return true
  }

  /**
   * Get time-based win rate multiplier
   */
  private getTimeWinRate(hour: number): number {
    if (hour >= 9 && hour < 11) return this.TIME_PERFORMANCE['9-11']
    if (hour >= 11 && hour < 13) return this.TIME_PERFORMANCE['11-13']
    if (hour >= 13 && hour < 14) return this.TIME_PERFORMANCE['13-14']
    if (hour >= 14 && hour < 15) return this.TIME_PERFORMANCE['14-15']
    return 0.50 // Default
  }

  /**
   * Get day-based win rate multiplier
   */
  private getDayWinRate(dayOfWeek: number): number {
    return this.DAY_PERFORMANCE[dayOfWeek as keyof typeof this.DAY_PERFORMANCE] || 0.50
  }

  /**
   * Generate single trade with pattern injection
   */
  private generateTrade(date: Date, strategy: string, forcePattern?: string): Trade {
    const symbols = Object.keys(this.SYMBOLS)
    const symbol = symbols[Math.floor(this.random() * symbols.length)]
    const basePrice = this.getSymbolPrice(symbol)
    const lotSize = this.getLotSize(symbol)
    const symbolData = this.SYMBOLS[symbol as keyof typeof this.SYMBOLS]

    // Base quantity
    let quantity = symbolData?.type === 'index'
      ? lotSize * (Math.floor(this.random() * 3) + 1) // 1-3 lots for indices
      : symbolData?.type === 'option'
        ? lotSize * (Math.floor(this.random() * 2) + 1) // 1-2 lots for options
        : Math.floor(this.random() * 450) + 50 // 50-500 shares for stocks

    // Strategy-based config
    const strategyConfig = this.STRATEGY_CONFIGS[strategy as keyof typeof this.STRATEGY_CONFIGS] || this.STRATEGY_CONFIGS.intraday

    // Time and day adjustments
    const hour = date.getHours()
    const dayOfWeek = date.getDay()
    const timeWinRate = this.getTimeWinRate(hour)
    const dayWinRate = this.getDayWinRate(dayOfWeek)
    // Ensure base win rate is reasonable (multiply by adjustment factors, not replace)
    const baseWinRate = strategyConfig.winRate * (timeWinRate / 0.50) * (dayWinRate / 0.50)
    // Clamp to reasonable range
    const adjustedWinRate = Math.max(0.45, Math.min(0.65, baseWinRate))

    // Determine if this will be a win or loss
    let willWin = this.random() < adjustedWinRate

    // PATTERN 1: Revenge Trading (20 instances)
    const dateKey = date.toISOString().split('T')[0]
    const timeSinceLastLoss = this.state.lastTradeTime && this.state.lastTradePnL < 0
      ? (date.getTime() - this.state.lastTradeTime.getTime()) / (1000 * 60) // minutes
      : 60

    if (forcePattern === 'revenge' || 
        (this.state.revengeTrades < 20 && 
         this.state.consecutiveLosses >= 2 && 
         timeSinceLastLoss < 30 && 
         this.random() > 0.92)) {
      quantity = Math.round(quantity * 2.2) // Double+ position size
      willWin = this.random() > 0.75 // 75% chance of loss
      this.state.revengeTrades++
    }

    // PATTERN 2: FOMO Trading (15 instances)
    if (forcePattern === 'fomo' || 
        (this.state.fomoTrades < 15 && 
         ((hour >= 10 && hour < 11) || (hour >= 14 && hour < 15)) &&
         this.random() > 0.95)) {
      quantity = Math.round(quantity * 1.8) // Large position
      willWin = this.random() > 0.65 // 65% loss rate
      this.state.fomoTrades++
    }

    // PATTERN 3: Overtrading (25 days with 8-12 trades)
    const dailyCount = this.state.dailyTradeCount.get(dateKey) || 0
    if (dailyCount >= 8 && dailyCount < 12) {
      // Slightly lower win rate but not too bad
      willWin = this.random() < (baseWinRate * 0.85) // 15% reduction
      if (!this.state.overtradingDays.has(dateKey)) {
        this.state.overtradingDays.add(dateKey)
      }
    }

    // PATTERN 4: Win Streak Overconfidence (10 instances)
    if (forcePattern === 'overconfident' || 
        (this.state.overconfidentTrades < 10 && 
         this.state.consecutiveWins >= 4 && 
         this.random() > 0.95)) {
      quantity = Math.round(quantity * 1.5)
      willWin = this.random() > 0.65 // 65% chance of loss
      this.state.overconfidentTrades++
    }

    // PATTERN 5: Loss Aversion (30 instances - small winners cut early, big losers held)
    if (forcePattern === 'loss_aversion' || 
        (this.state.lossAversionTrades < 30 && 
         this.random() > 0.92)) {
      // Small winners cut early (reduced profit)
      if (willWin) {
        willWin = true // Still a win, but smaller
      } else {
        // Big losers held too long (increased loss)
        willWin = false
      }
      this.state.lossAversionTrades++
    }

    // PATTERN 6: Weekend Warrior (15 instances - Friday afternoon heavy trading)
    if (forcePattern === 'weekend_warrior' || 
        (this.state.weekendWarriorTrades < 15 && 
         dayOfWeek === 5 && hour >= 14 && 
         this.random() > 0.96)) {
      quantity = Math.round(quantity * 1.5)
      willWin = this.random() < (baseWinRate * 0.75) // 25% reduction
      this.state.weekendWarriorTrades++
    }

    // PATTERN 7: Revenge Sizing (18 instances)
    if (forcePattern === 'revenge_sizing' || 
        (this.state.revengeSizingTrades < 18 && 
         this.state.lastTradePnL < 0 && 
         quantity > this.state.avgPositionSize * 1.5 && 
         this.random() > 0.88)) {
      this.state.revengeSizingTrades++
    }

    // PATTERN 8: News Trading (12 instances)
    if (forcePattern === 'news' || 
        (this.state.newsTrades < 12 && 
         this.random() > 0.97)) {
      // Trading during high-impact hours
      quantity = Math.round(quantity * 1.3)
      willWin = this.random() < (baseWinRate * 0.80) // 20% reduction
      this.state.newsTrades++
    }

    // Calculate P&L based on strategy
    let pnl: number
    if (willWin) {
      const winMultiplier = 1 + (this.random() * 0.5) // 1.0x to 1.5x avg winner
      pnl = strategyConfig.avgWinner * winMultiplier
    } else {
      const lossMultiplier = 1 + (this.random() * 0.5) // 1.0x to 1.5x avg loser
      pnl = -strategyConfig.avgLoser * lossMultiplier
    }

    // Adjust for quantity (normalize to base quantity)
    const baseQty = symbolData?.type === 'index' ? lotSize : symbolData?.type === 'option' ? lotSize : 100
    pnl = (pnl / baseQty) * quantity

    // Clamp P&L to realistic range
    pnl = Math.max(-15000, Math.min(12000, pnl))

    // Calculate entry/exit prices
    const entryPrice = basePrice * (1 + (this.random() - 0.5) * 0.01) // ±0.5% entry variation
    const pnlPercent = pnl / (entryPrice * quantity)
    const exitPrice = entryPrice * (1 + pnlPercent)

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

    // Rule violations
    if (hour >= 14 && hour < 15) {
      this.state.timeViolations++
    }
    if (dailyCount >= 5) {
      this.state.tradeCountViolations++
    }
    if (dailyPnL + pnl < -5000) {
      this.state.lossLimitViolations++
    }

    // Generate notes and tags
    const setup = this.SETUPS[Math.floor(this.random() * this.SETUPS.length)]
    const notes = this.generateNotes(pnl, setup, strategy)
    const tags = this.generateTags(pnl, setup, strategy, forcePattern)

    // Determine product type
    const productRand = this.random()
    const product: 'MIS' | 'CNC' | 'NRML' = 
      strategy === 'scalping' || strategy === 'intraday' ? 'MIS' :
      strategy === 'swing' || strategy === 'positional' ? 'CNC' :
      productRand < 0.7 ? 'MIS' : productRand < 0.9 ? 'CNC' : 'NRML'

    // Determine transaction type
    const transactionType: 'BUY' | 'SELL' = this.random() > 0.5 ? 'BUY' : 'SELL'

    return {
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
      trade_id: `TEST_${Date.now()}_${Math.floor(this.random() * 100000)}`,
      strategy,
      setup,
      notes,
      tags
    }
  }

  /**
   * Generate realistic trader notes
   */
  private generateNotes(pnl: number, setup: string, strategy: string): string {
    const winNotes = [
      `Clean ${setup} setup on ${strategy}, followed plan perfectly. Entry was precise and exit at target.`,
      `${setup} pattern worked well with ${strategy}. Managed risk properly with tight stop loss.`,
      `Entered on ${setup} confirmation using ${strategy}, exited at first target. Good execution.`,
      `Price action ${setup} setup. Waited for confirmation before entry. ${strategy} strategy paid off.`,
      `${setup} trade using ${strategy}, followed my rules. Cut losses quickly when needed.`,
      `Solid ${strategy} trade on ${setup}. Entry timing was perfect, exit at target.`,
      `${setup} setup with ${strategy} worked as expected. Good risk management.`
    ]

    const lossNotes = [
      `Impulsive ${setup} trade on ${strategy}. Should have waited for better confirmation.`,
      `Overtraded on ${setup} using ${strategy}. Need to improve discipline and wait for A+ setups only.`,
      `Missed stop loss on ${setup} trade with ${strategy}. Let it run against me instead of cutting quickly.`,
      `${setup} setup but entered too early with ${strategy}. Need to wait for proper confirmation.`,
      `Revenge trade after previous loss. ${setup} wasn't the best setup for ${strategy}.`,
      `${strategy} trade on ${setup} went against me. Should have respected the stop loss.`,
      `FOMO entry on ${setup} using ${strategy}. Need to be more patient.`
    ]

    if (pnl > 0) {
      return winNotes[Math.floor(this.random() * winNotes.length)]
    } else {
      return lossNotes[Math.floor(this.random() * lossNotes.length)]
    }
  }

  /**
   * Generate tags
   */
  private generateTags(pnl: number, setup: string, strategy: string, pattern?: string): string {
    const tags: string[] = []

    if (pnl > 0) tags.push('winner')
    else if (pnl < -100) tags.push('loser')
    else tags.push('scratch')

    tags.push(setup.toLowerCase().replace(/\s+/g, '_'))
    tags.push(strategy.toLowerCase())

    if (pattern === 'revenge') tags.push('revenge', 'emotional')
    if (pattern === 'fomo') tags.push('fomo', 'emotional')
    if (pattern === 'overconfident') tags.push('overconfident')
    if (pattern === 'news') tags.push('news-trade')
    if (this.state.consecutiveLosses >= 2) tags.push('emotional')
    if (this.state.consecutiveWins >= 3) tags.push('disciplined')

    return tags.join(',')
  }

  /**
   * Generate all trades for 1 year
   */
  public generate(): Trade[] {
    console.log('🚀 Starting trade generation...')
    console.log(`📅 Date range: ${this.startDate.toISOString().split('T')[0]} to ${this.endDate.toISOString().split('T')[0]}`)

    let currentDate = new Date(this.startDate)
    let tradeCount = 0
    const targetTrades = 400 + Math.floor(this.random() * 100) // 400-500 trades

    while (currentDate <= this.endDate && tradeCount < targetTrades) {
      if (!this.isTradingDay(currentDate)) {
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }

      // Determine number of trades for this day (1-5 typically, 8-12 on overtrading days)
      const dateKey = currentDate.toISOString().split('T')[0]
      const isOvertradingDay = this.state.overtradingDays.has(dateKey) || 
                                (this.state.overtradingDays.size < 25 && this.random() > 0.98)

      if (isOvertradingDay && this.state.overtradingDays.size < 25) {
        this.state.overtradingDays.add(dateKey)
      }

      const tradesToday = isOvertradingDay 
        ? 8 + Math.floor(this.random() * 5) // 8-12 trades
        : 1 + Math.floor(this.random() * 4) // 1-4 trades

      // Generate trades for this day
      for (let i = 0; i < tradesToday && tradeCount < targetTrades; i++) {
        // Select strategy based on weights
        const strategyRand = this.random()
        let strategy = 'intraday'
        if (strategyRand < 0.40) strategy = 'scalping'
        else if (strategyRand < 0.70) strategy = 'intraday'
        else if (strategyRand < 0.90) strategy = 'swing'
        else strategy = 'options'

        // Generate trade time (9:30 AM to 3:30 PM IST)
        const hour = 9 + Math.floor(this.random() * 6) // 9-14 (9:30 AM to 2:30 PM)
        const minute = hour === 9 ? 30 + Math.floor(this.random() * 30) : Math.floor(this.random() * 60)
        const tradeDate = new Date(currentDate)
        tradeDate.setHours(hour, minute, Math.floor(this.random() * 60))

        // Determine if we should inject a specific pattern
        let forcePattern: string | undefined
        if (this.state.revengeTrades < 20 && this.state.consecutiveLosses >= 2 && this.random() > 0.95) {
          forcePattern = 'revenge'
        } else if (this.state.fomoTrades < 15 && (hour >= 10 && hour < 11) && this.random() > 0.95) {
          forcePattern = 'fomo'
        } else if (this.state.overconfidentTrades < 10 && this.state.consecutiveWins >= 4 && this.random() > 0.95) {
          forcePattern = 'overconfident'
        }

        const trade = this.generateTrade(tradeDate, strategy, forcePattern)
        this.trades.push(trade)
        tradeCount++

        // Small delay to ensure unique timestamps
        tradeDate.setSeconds(tradeDate.getSeconds() + 1)
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Sort trades by date
    this.trades.sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime())

    console.log(`✅ Generated ${this.trades.length} trades`)
    return this.trades
  }

  /**
   * Export to CSV format matching TradeAutopsy import requirements
   */
  public exportCSV(filename: string): void {
    // CSV header matching the import format
    const header = 'Tradingsymbol,Transaction Type,Quantity,Price,Trade Date,Product,Order ID\n'

    const rows = this.trades.map(t => {
      // Format date as YYYY-MM-DD (TradeAutopsy expects this format)
      const tradeDate = new Date(t.trade_date)
      const dateStr = tradeDate.toISOString().split('T')[0]

      // Escape fields that might contain commas
      const symbol = t.tradingsymbol.includes(',') ? `"${t.tradingsymbol}"` : t.tradingsymbol
      const transactionType = t.transaction_type
      const quantity = t.quantity
      const price = t.average_price
      const product = t.product || 'MIS'
      const orderId = t.trade_id || ''

      return `${symbol},${transactionType},${quantity},${price},${dateStr},${product},${orderId}`
    }).join('\n')

    const csvContent = header + rows
    fs.writeFileSync(filename, csvContent, 'utf-8')
    console.log(`📄 CSV exported to: ${filename}`)
  }

  /**
   * Generate summary statistics
   */
  public generateSummary(): any {
    const totalTrades = this.trades.length
    const netPnL = this.trades.reduce((sum, t) => sum + t.pnl, 0)
    const winners = this.trades.filter(t => t.pnl > 0).length
    const winRate = totalTrades > 0 ? winners / totalTrades : 0

    const strategyStats: Record<string, any> = {}
    this.STRATEGIES.forEach(strategy => {
      const strategyTrades = this.trades.filter(t => t.strategy === strategy)
      const strategyWinners = strategyTrades.filter(t => t.pnl > 0).length
      strategyStats[strategy] = {
        count: strategyTrades.length,
        win_rate: strategyTrades.length > 0 ? strategyWinners / strategyTrades.length : 0,
        net_pnl: strategyTrades.reduce((sum, t) => sum + t.pnl, 0)
      }
    })

    const firstTrade = this.trades[0]
    const lastTrade = this.trades[this.trades.length - 1]

    return {
      total_trades: totalTrades,
      date_range: {
        start: firstTrade ? new Date(firstTrade.trade_date).toISOString().split('T')[0] : null,
        end: lastTrade ? new Date(lastTrade.trade_date).toISOString().split('T')[0] : null
      },
      net_pnl: parseFloat(netPnL.toFixed(2)),
      win_rate: parseFloat(winRate.toFixed(3)),
      total_winners: winners,
      total_losers: totalTrades - winners,
      patterns_injected: {
        revenge_trading: this.state.revengeTrades,
        fomo: this.state.fomoTrades,
        overtrading_days: this.state.overtradingDays.size,
        win_streak_overconfidence: this.state.overconfidentTrades,
        loss_aversion: this.state.lossAversionTrades,
        weekend_warrior: this.state.weekendWarriorTrades,
        revenge_sizing: this.state.revengeSizingTrades,
        news_trading: this.state.newsTrades
      },
      rule_violations: {
        time: this.state.timeViolations,
        trade_count: this.state.tradeCountViolations,
        loss_limit: this.state.lossLimitViolations
      },
      strategies: strategyStats
    }
  }
}

// Main execution
function main() {
  console.log('🎯 TradeAutopsy 1-Year Test CSV Generator\n')

  const generator = new TradeDataGenerator(12345) // Fixed seed for reproducibility
  generator.generate()

  // Export CSV
  const csvPath = path.join(process.cwd(), 'test-trades-1year.csv')
  generator.exportCSV(csvPath)

  // Generate summary
  const summary = generator.generateSummary()
  const summaryPath = path.join(process.cwd(), 'test-data-summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')
  console.log(`📊 Summary exported to: ${summaryPath}`)

  // Print summary
  console.log('\n📈 Generation Summary:')
  console.log(`   Total Trades: ${summary.total_trades}`)
  console.log(`   Date Range: ${summary.date_range.start} to ${summary.date_range.end}`)
  console.log(`   Net P&L: ₹${summary.net_pnl.toLocaleString('en-IN')}`)
  console.log(`   Win Rate: ${(summary.win_rate * 100).toFixed(1)}%`)
  console.log(`   Patterns: ${Object.values(summary.patterns_injected).reduce((a: number, b: number) => a + b, 0)} instances`)
  console.log(`   Violations: ${Object.values(summary.rule_violations).reduce((a: any, b: any) => (a as number) + (b as number), 0)} instances`)

  console.log('\n✅ Generation complete!')
  console.log('📝 Import the CSV file through the TradeAutopsy dashboard to test all features.')
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { TradeDataGenerator }
