// ═══════════════════════════════════════════════════════════════════
// BACKTESTING ENGINE - Core backtesting logic
// ═══════════════════════════════════════════════════════════════════

import { BacktestConfig, BacktestResult, BacktestedTrade, TradeLeg } from '@/types/backtesting';
import { calculatePayoff } from './payoff';
import { calculateGreeks } from './greeks';

export class BacktestEngine {
  private config: BacktestConfig;
  private trades: BacktestedTrade[] = [];
  private equityCurve: { date: Date | string; equity: number }[] = [];
  private currentCapital: number;

  constructor(config: BacktestConfig) {
    this.config = config;
    this.currentCapital = config.initialCapital;
  }

  /**
   * Run the complete backtest
   */
  async runBacktest(): Promise<BacktestResult> {
    console.log('Starting backtest:', this.config.name);

    try {
      // Initialize
      this.trades = [];
      this.equityCurve = [];
      this.currentCapital = this.config.initialCapital;

      // Get date range
      const startDate = typeof this.config.startDate === 'string' 
        ? new Date(this.config.startDate) 
        : this.config.startDate;
      const endDate = typeof this.config.endDate === 'string'
        ? new Date(this.config.endDate)
        : this.config.endDate;

      let currentDate = new Date(startDate);

      // Iterate through each trading day
      while (currentDate <= endDate) {
        // Skip weekends
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          await this.processDay(new Date(currentDate));
        }

        // Record equity
        this.equityCurve.push({
          date: new Date(currentDate),
          equity: this.currentCapital,
        });

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Calculate final metrics
      return this.calculateResults();
    } catch (error) {
      console.error('Backtest error:', error);
      throw error;
    }
  }

  /**
   * Process a single trading day
   */
  private async processDay(date: Date): Promise<void> {
    // Check if we should enter new position
    if (this.shouldEnterPosition(date)) {
      await this.enterPosition(date);
    }

    // Check exit conditions for open positions
    await this.checkExitConditions(date);
  }

  /**
   * Check if entry conditions are met
   */
  private shouldEnterPosition(date: Date): boolean {
    // Check if we have capital available
    if (this.currentCapital < this.config.initialCapital * 0.2) {
      return false; // Not enough capital
    }

    // Check if we already have an open position
    const openTrades = this.trades.filter(t => {
      const exitDate = typeof t.exitDate === 'string' ? new Date(t.exitDate) : t.exitDate;
      return !exitDate || exitDate > date;
    });
    if (openTrades.length > 0) {
      return false; // Already in a position
    }

    // Check if it's the right time to enter
    return true;
  }

  /**
   * Enter a new position
   */
  private async enterPosition(date: Date): Promise<void> {
    try {
      // Calculate expiry date based on config
      const expiryDate = this.calculateExpiryDate(
        date,
        this.config.entryRules.daysToExpiry
      );

      // Get spot price (in real implementation, fetch from historical data)
      const spotPrice = await this.getSpotPrice(date);

      // Select strikes based on strategy
      const strikes = this.selectStrikes(spotPrice);

      // Build legs based on strategy template
      const legs: TradeLeg[] = this.config.legsConfig.map((templateLeg, index) => {
        const strikePrice = strikes[index];
        const premium = this.calculatePremium(
          spotPrice,
          strikePrice,
          this.config.entryRules.daysToExpiry,
          templateLeg.instrumentType
        );

        return {
          ...templateLeg,
          legNumber: index + 1,
          strikePrice,
          expiryDate,
          entryPrice: premium,
          premium,
        };
      });

      // Calculate total cost
      const totalCost = this.calculateTotalCost(legs);

      // Check if we can afford it
      if (totalCost > this.currentCapital) {
        return; // Skip this trade
      }

      // Create trade
      const trade: BacktestedTrade = {
        entryDate: date,
        exitDate: expiryDate, // Will be updated if early exit
        entryPrice: totalCost,
        exitPrice: 0, // Will be calculated on exit
        quantity: 1,
        pnl: 0,
        pnlPct: 0,
        durationDays: 0,
        legs,
      };

      this.trades.push(trade);
      this.currentCapital -= totalCost;

      console.log(`Entered position on ${date.toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Error entering position:', error);
    }
  }

  /**
   * Check exit conditions for open trades
   */
  private async checkExitConditions(date: Date): Promise<void> {
    const openTrades = this.trades.filter(t => {
      const exitDate = typeof t.exitDate === 'string' ? new Date(t.exitDate) : t.exitDate;
      return !exitDate || exitDate > date;
    });

    for (const trade of openTrades) {
      let shouldExit = false;
      let exitReason = '';

      // Get current P&L
      const currentPnL = await this.calculateCurrentPnL(trade, date);
      const pnlPct = (currentPnL / trade.entryPrice) * 100;

      // Check target profit
      if (
        this.config.exitRules.targetProfitPct &&
        pnlPct >= this.config.exitRules.targetProfitPct
      ) {
        shouldExit = true;
        exitReason = 'Target profit reached';
      }

      // Check stop loss
      if (
        this.config.exitRules.stopLossPct &&
        pnlPct <= -this.config.exitRules.stopLossPct
      ) {
        shouldExit = true;
        exitReason = 'Stop loss hit';
      }

      // Check days to expiry
      const exitDate = typeof trade.exitDate === 'string' ? new Date(trade.exitDate) : trade.exitDate;
      const daysToExpiry = Math.ceil(
        (exitDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (
        this.config.exitRules.daysToExpiry &&
        daysToExpiry <= this.config.exitRules.daysToExpiry
      ) {
        shouldExit = true;
        exitReason = 'Days to expiry threshold';
      }

      // Check if expiry reached
      if (date >= exitDate) {
        shouldExit = true;
        exitReason = 'Expiry reached';
      }

      // Exit if conditions met
      if (shouldExit) {
        await this.exitPosition(trade, date, exitReason);
      }
    }
  }

  /**
   * Exit a position
   */
  private async exitPosition(
    trade: BacktestedTrade,
    date: Date,
    reason: string
  ): Promise<void> {
    const exitValue = await this.calculateExitValue(trade, date);
    const pnl = exitValue - trade.entryPrice;
    const pnlPct = (pnl / trade.entryPrice) * 100;

    // Update trade
    trade.exitDate = date;
    trade.exitPrice = exitValue;
    trade.pnl = pnl;
    trade.pnlPct = pnlPct;
    const entryDate = typeof trade.entryDate === 'string' ? new Date(trade.entryDate) : trade.entryDate;
    trade.durationDays = Math.ceil(
      (date.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Update capital
    this.currentCapital += exitValue;

    console.log(
      `Exited position on ${date.toISOString().split('T')[0]} | Reason: ${reason} | P&L: ₹${pnl.toFixed(2)}`
    );
  }

  /**
   * Calculate expiry date based on days to expiry
   */
  private calculateExpiryDate(date: Date, daysToExpiry: number): Date {
    const expiry = new Date(date);
    expiry.setDate(expiry.getDate() + daysToExpiry);

    // Round to next Thursday (weekly expiry)
    while (expiry.getDay() !== 4) {
      expiry.setDate(expiry.getDate() + 1);
    }

    return expiry;
  }

  /**
   * Get spot price for a given date
   * In production, this would fetch from historical data
   */
  private async getSpotPrice(date: Date): Promise<number> {
    // Simplified: return a simulated price
    // In production: SELECT spot_price FROM historical_data WHERE date = ?
    return 21000 + Math.random() * 1000 - 500; // Random price around 21000
  }

  /**
   * Select strikes based on strategy and spot price
   */
  private selectStrikes(spotPrice: number): number[] {
    const strikes: number[] = [];
    const strikeGap = 100; // NIFTY strike gap

    for (const leg of this.config.legsConfig) {
      let strike = spotPrice;

      // Adjust based on strike selection
      switch (this.config.entryRules.strikeSelection) {
        case 'ATM':
          strike = Math.round(spotPrice / strikeGap) * strikeGap;
          break;
        case 'OTM':
          if (leg.instrumentType === 'call') {
            strike = Math.round(spotPrice / strikeGap) * strikeGap + strikeGap;
          } else if (leg.instrumentType === 'put') {
            strike = Math.round(spotPrice / strikeGap) * strikeGap - strikeGap;
          }
          break;
        case 'ITM':
          if (leg.instrumentType === 'call') {
            strike = Math.round(spotPrice / strikeGap) * strikeGap - strikeGap;
          } else if (leg.instrumentType === 'put') {
            strike = Math.round(spotPrice / strikeGap) * strikeGap + strikeGap;
          }
          break;
      }

      strikes.push(strike);
    }

    return strikes;
  }

  /**
   * Calculate premium for an option
   */
  private calculatePremium(
    spotPrice: number,
    strikePrice: number,
    daysToExpiry: number,
    instrumentType: string
  ): number {
    // Simplified premium calculation
    // In production, use Black-Scholes or fetch from historical data
    const timeValue = daysToExpiry * 2;
    const intrinsic = Math.max(
      0,
      instrumentType === 'call' ? spotPrice - strikePrice : strikePrice - spotPrice
    );

    return intrinsic + timeValue + Math.random() * 20;
  }

  /**
   * Calculate total cost of a strategy
   */
  private calculateTotalCost(legs: TradeLeg[]): number {
    let totalCost = 0;

    for (const leg of legs) {
      const multiplier = leg.action === 'buy' ? 1 : -1;
      totalCost += leg.entryPrice * leg.quantity * multiplier;
    }

    // Add commissions if configured
    if (this.config.commissionPerLeg) {
      totalCost += legs.length * this.config.commissionPerLeg;
    }

    return Math.abs(totalCost);
  }

  /**
   * Calculate current P&L for a trade
   */
  private async calculateCurrentPnL(trade: BacktestedTrade, date: Date): Promise<number> {
    const currentValue = await this.calculateExitValue(trade, date);
    return currentValue - trade.entryPrice;
  }

  /**
   * Calculate exit value of a strategy
   */
  private async calculateExitValue(trade: BacktestedTrade, date: Date): Promise<number> {
    const spotPrice = await this.getSpotPrice(date);
    let totalValue = 0;

    for (const leg of trade.legs) {
      if (!leg.strikePrice) continue;

      // Calculate intrinsic value
      let intrinsicValue = 0;
      if (leg.instrumentType === 'call') {
        intrinsicValue = Math.max(0, spotPrice - leg.strikePrice);
      } else if (leg.instrumentType === 'put') {
        intrinsicValue = Math.max(0, leg.strikePrice - spotPrice);
      }

      // Add time value if not at expiry
      const exitDate = typeof trade.exitDate === 'string' ? new Date(trade.exitDate) : trade.exitDate;
      const daysToExpiry = Math.ceil(
        (exitDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      const timeValue = daysToExpiry > 0 ? daysToExpiry * 1.5 : 0;
      const currentPremium = intrinsicValue + timeValue;

      const multiplier = leg.action === 'buy' ? 1 : -1;
      totalValue += currentPremium * leg.quantity * multiplier;
    }

    return Math.max(0, totalValue);
  }

  /**
   * Calculate final backtest results
   */
  private calculateResults(): BacktestResult {
    const winningTrades = this.trades.filter(t => t.pnl > 0);
    const losingTrades = this.trades.filter(t => t.pnl < 0);

    const totalPnL = this.trades.reduce((sum, t) => sum + t.pnl, 0);
    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
      : 0;
    const avgLoss = losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length
      : 0;

    const largestWin = winningTrades.length > 0
      ? Math.max(...winningTrades.map(t => t.pnl))
      : 0;
    const largestLoss = losingTrades.length > 0
      ? Math.min(...losingTrades.map(t => t.pnl))
      : 0;

    // Calculate drawdown
    const { maxDrawdown, maxDrawdownPct } = this.calculateDrawdown();

    // Calculate profit factor
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    // Calculate Sharpe ratio
    const sharpeRatio = this.calculateSharpeRatio();

    // Calculate monthly returns
    const monthlyReturns = this.calculateMonthlyReturns();

    return {
      id: crypto.randomUUID(),
      configId: this.config.id || '',
      totalTrades: this.trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: this.trades.length > 0 ? (winningTrades.length / this.trades.length) * 100 : 0,
      totalPnL,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      maxDrawdown,
      maxDrawdownPct,
      profitFactor,
      sharpeRatio,
      avgTradeDuration:
        this.trades.length > 0
          ? this.trades.reduce((sum, t) => sum + t.durationDays, 0) / this.trades.length
          : 0,
      totalCommissions: this.calculateTotalCommissions(),
      finalCapital: this.currentCapital,
      returnPct: ((this.currentCapital - this.config.initialCapital) / this.config.initialCapital) * 100,
      equityCurve: this.equityCurve,
      tradeDetails: this.trades,
      monthlyReturns,
      status: 'completed',
      createdAt: new Date(),
      completedAt: new Date(),
    };
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateDrawdown(): { maxDrawdown: number; maxDrawdownPct: number } {
    let peak = this.config.initialCapital;
    let maxDrawdown = 0;
    let maxDrawdownPct = 0;

    for (const point of this.equityCurve) {
      if (point.equity > peak) {
        peak = point.equity;
      }

      const drawdown = peak - point.equity;
      const drawdownPct = (drawdown / peak) * 100;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPct = drawdownPct;
      }
    }

    return { maxDrawdown, maxDrawdownPct };
  }

  /**
   * Calculate Sharpe ratio
   */
  private calculateSharpeRatio(): number {
    if (this.trades.length === 0) return 0;

    const returns = this.trades.map(t => t.pnlPct);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    const riskFreeRate = 6; // 6% annual
    const excessReturn = avgReturn - riskFreeRate / 252; // Daily risk-free rate

    return stdDev > 0 ? (excessReturn / stdDev) * Math.sqrt(252) : 0;
  }

  /**
   * Calculate monthly returns
   */
  private calculateMonthlyReturns(): Record<string, number> {
    const monthlyReturns: Record<string, number> = {};

    for (const trade of this.trades) {
      const exitDate = typeof trade.exitDate === 'string' ? new Date(trade.exitDate) : trade.exitDate;
      const month = exitDate.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyReturns[month]) {
        monthlyReturns[month] = 0;
      }
      monthlyReturns[month] += trade.pnl;
    }

    return monthlyReturns;
  }

  /**
   * Calculate total commissions paid
   */
  private calculateTotalCommissions(): number {
    if (!this.config.commissionPerLeg) return 0;

    let totalCommissions = 0;
    for (const trade of this.trades) {
      totalCommissions += trade.legs.length * this.config.commissionPerLeg * 2; // Entry + Exit
    }

    return totalCommissions;
  }
}
