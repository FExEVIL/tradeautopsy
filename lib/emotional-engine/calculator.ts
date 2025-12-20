// ════════════════════════════════════════════════════════════════════
// EMOTIONAL CALCULATION ENGINE
// Calculates emotional state based on trading patterns
// ════════════════════════════════════════════════════════════════════

export interface EmotionalState {
  overall: number; // 0-100 (0=worst, 100=best)
  confidence: number; // 0-100
  discipline: number; // 0-100
  patience: number; // 0-100
  emotionalControl: number; // 0-100
  riskAwareness: number; // 0-100
  
  // Specific emotions
  fear: number; // 0-100 (higher = more fear)
  greed: number; // 0-100 (higher = more greed)
  revenge: number; // 0-100 (higher = more revenge trading)
  overconfidence: number; // 0-100
  
  // Recommendations
  status: 'excellent' | 'good' | 'neutral' | 'warning' | 'critical';
  recommendation: string;
  insights: string[];
}

export interface TradeForEmotionalAnalysis {
  id: string;
  entryTime: Date;
  exitTime?: Date;
  pnl: number;
  size: number;
  strategyType: string;
  tags?: string[];
  notes?: string;
  emotionalTags?: string[];
}

export class EmotionalCalculationEngine {
  /**
   * Calculate comprehensive emotional state
   */
  static calculateEmotionalState(
    trades: TradeForEmotionalAnalysis[]
  ): EmotionalState {
    if (trades.length === 0) {
      return EmotionalCalculationEngine.getDefaultState();
    }

    const recentTrades = EmotionalCalculationEngine.getRecentTrades(trades, 30); // Last 30 days

    // Calculate individual components
    const discipline = EmotionalCalculationEngine.calculateDiscipline(recentTrades);
    const patience = EmotionalCalculationEngine.calculatePatience(recentTrades);
    const emotionalControl = EmotionalCalculationEngine.calculateEmotionalControl(recentTrades);
    const riskAwareness = EmotionalCalculationEngine.calculateRiskAwareness(recentTrades);
    const confidence = EmotionalCalculationEngine.calculateConfidence(recentTrades);

    // Calculate negative emotions
    const fear = EmotionalCalculationEngine.calculateFear(recentTrades);
    const greed = EmotionalCalculationEngine.calculateGreed(recentTrades);
    const revenge = EmotionalCalculationEngine.calculateRevenge(recentTrades);
    const overconfidence = EmotionalCalculationEngine.calculateOverconfidence(recentTrades);

    // Calculate overall score (weighted average)
    const overall = Math.round(
      discipline * 0.25 +
      patience * 0.2 +
      emotionalControl * 0.25 +
      riskAwareness * 0.15 +
      confidence * 0.15
    );

    // Determine status
    const status = EmotionalCalculationEngine.determineStatus(overall);

    // Generate insights
    const insights = EmotionalCalculationEngine.generateInsights({
      discipline,
      patience,
      emotionalControl,
      fear,
      greed,
      revenge,
      overconfidence,
      trades: recentTrades,
    });

    // Generate recommendation
    const recommendation = EmotionalCalculationEngine.generateRecommendation(status, insights);

    return {
      overall,
      confidence,
      discipline,
      patience,
      emotionalControl,
      riskAwareness,
      fear,
      greed,
      revenge,
      overconfidence,
      status,
      recommendation,
      insights,
    };
  }

  /**
   * Calculate discipline score
   */
  private static calculateDiscipline(trades: TradeForEmotionalAnalysis[]): number {
    let score = 100;

    // Penalty for overtrading
    const tradesPerDay = EmotionalCalculationEngine.getTradesPerDay(trades);
    const overtradingDays = Object.values(tradesPerDay).filter((count) => count > 5).length;
    score -= overtradingDays * 5;

    // Penalty for trading without stop loss (check tags)
    const tradesWithoutStopLoss = trades.filter(
      (t) => t.tags?.includes('no-stop-loss') || t.emotionalTags?.includes('no-stop-loss')
    ).length;
    score -= (tradesWithoutStopLoss / trades.length) * 20;

    // Penalty for not following strategy
    const strategyViolations = trades.filter(
      (t) => t.tags?.includes('strategy-violation')
    ).length;
    score -= (strategyViolations / trades.length) * 30;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate patience score
   */
  private static calculatePatience(trades: TradeForEmotionalAnalysis[]): number {
    let score = 100;

    // Penalty for trades taken too quickly after a loss
    let quickTradesAfterLoss = 0;
    for (let i = 1; i < trades.length; i++) {
      const prevTrade = trades[i - 1];
      const currentTrade = trades[i];

      if (prevTrade.pnl < 0) {
        const exitTime = prevTrade.exitTime || prevTrade.entryTime;
        const timeDiff =
          (currentTrade.entryTime.getTime() - exitTime.getTime()) /
          (1000 * 60); // minutes

        if (timeDiff < 30) {
          quickTradesAfterLoss++;
        }
      }
    }

    score -= (quickTradesAfterLoss / trades.length) * 50;

    // Bonus for trades with longer holding periods
    const avgHoldingTime = EmotionalCalculationEngine.calculateAverageHoldingTime(trades);
    if (avgHoldingTime > 4 * 60) {
      // > 4 hours
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate emotional control score
   */
  private static calculateEmotionalControl(trades: TradeForEmotionalAnalysis[]): number {
    let score = 100;

    // Check for emotional tags
    const emotionalTrades = trades.filter(
      (t) =>
        t.emotionalTags?.some((tag) =>
          ['angry', 'frustrated', 'anxious', 'stressed'].includes(tag)
        ) || t.tags?.some((tag) => ['emotional', 'impulsive'].includes(tag))
    );

    score -= (emotionalTrades.length / trades.length) * 40;

    // Check for position size violations during losing streaks
    const losingStreaks = EmotionalCalculationEngine.findLosingStreaks(trades);
    let oversizedDuringLoss = 0;

    for (const streak of losingStreaks) {
      const avgSize = trades.reduce((sum, t) => sum + t.size, 0) / trades.length;
      const streakTrades = trades.slice(streak.start, streak.end + 1);
      const oversized = streakTrades.filter((t) => t.size > avgSize * 1.5).length;
      oversizedDuringLoss += oversized;
    }

    score -= (oversizedDuringLoss / trades.length) * 30;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate risk awareness score
   */
  private static calculateRiskAwareness(trades: TradeForEmotionalAnalysis[]): number {
    let score = 100;

    // Calculate risk-reward ratios
    const avgRiskReward = EmotionalCalculationEngine.calculateAverageRiskReward(trades);
    if (avgRiskReward < 1.5) {
      score -= 20;
    }

    // Check for proper position sizing
    const positionSizeStdDev = EmotionalCalculationEngine.calculatePositionSizeStdDev(trades);
    const avgSize = trades.reduce((sum, t) => sum + t.size, 0) / trades.length;
    const coefficientOfVariation = positionSizeStdDev / avgSize;

    if (coefficientOfVariation > 0.5) {
      // High variability = poor risk management
      score -= 25;
    }

    // Penalty for not using stop losses
    const tradesWithStopLoss = trades.filter(
      (t) => t.tags?.includes('stop-loss-used')
    ).length;
    score -= ((trades.length - tradesWithStopLoss) / trades.length) * 30;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate confidence score
   */
  private static calculateConfidence(trades: TradeForEmotionalAnalysis[]): number {
    const recentWinRate = EmotionalCalculationEngine.calculateWinRate(trades.slice(-20)); // Last 20 trades
    const overallWinRate = EmotionalCalculationEngine.calculateWinRate(trades);

    // Base confidence on win rate
    let score = overallWinRate;

    // Adjust based on recent performance
    if (recentWinRate > overallWinRate + 10) {
      score += 10; // Recent improvement
    } else if (recentWinRate < overallWinRate - 10) {
      score -= 10; // Recent decline
    }

    // Check for consistency
    const consistency = EmotionalCalculationEngine.calculateConsistency(trades);
    score += consistency * 0.2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate fear level
   */
  private static calculateFear(trades: TradeForEmotionalAnalysis[]): number {
    let fear = 0;

    // Check for signs of fear
    const avgSize = EmotionalCalculationEngine.calculateAverageSize(trades);
    const smallPositionSizes = trades.filter(
      (t) => t.size < avgSize * 0.5
    ).length;
    fear += (smallPositionSizes / trades.length) * 30;

    // Check for early exits
    const earlyExits = trades.filter((t) => {
      const holdingTime = EmotionalCalculationEngine.getHoldingTime(t);
      return holdingTime < 30 && t.pnl > 0; // Exited profitable trade quickly
    }).length;
    fear += (earlyExits / trades.length) * 40;

    // Check for fear-related tags
    const fearTrades = trades.filter(
      (t) => t.emotionalTags?.includes('fear') || t.tags?.includes('scared')
    ).length;
    fear += (fearTrades / trades.length) * 30;

    return Math.min(100, fear);
  }

  /**
   * Calculate greed level
   */
  private static calculateGreed(trades: TradeForEmotionalAnalysis[]): number {
    let greed = 0;

    // Check for oversized positions
    const avgSize = EmotionalCalculationEngine.calculateAverageSize(trades);
    const oversizedTrades = trades.filter((t) => t.size > avgSize * 2).length;
    greed += (oversizedTrades / trades.length) * 40;

    // Check for holding winners too long (giving back profits)
    const gaveBackProfits = trades.filter((t) => {
      return t.tags?.includes('gave-back-profits') || t.notes?.includes('should have exited earlier');
    }).length;
    greed += (gaveBackProfits / trades.length) * 30;

    // Check for greed-related tags
    const greedTrades = trades.filter(
      (t) => t.emotionalTags?.includes('greed') || t.tags?.includes('greedy')
    ).length;
    greed += (greedTrades / trades.length) * 30;

    return Math.min(100, greed);
  }

  /**
   * Calculate revenge trading level
   */
  private static calculateRevenge(trades: TradeForEmotionalAnalysis[]): number {
    let revenge = 0;

    // Check for trades taken quickly after losses
    let quickTradesAfterLoss = 0;
    for (let i = 1; i < trades.length; i++) {
      const prevTrade = trades[i - 1];
      const currentTrade = trades[i];

      if (prevTrade.pnl < 0) {
        const exitTime = prevTrade.exitTime || prevTrade.entryTime;
        const timeDiff =
          (currentTrade.entryTime.getTime() - exitTime.getTime()) /
          (1000 * 60);

        if (timeDiff < 30) {
          quickTradesAfterLoss++;

          // Extra penalty if position size increased
          if (currentTrade.size > prevTrade.size) {
            quickTradesAfterLoss += 0.5;
          }
        }
      }
    }

    revenge = (quickTradesAfterLoss / trades.length) * 100;

    // Check for revenge trading tags
    const revengeTrades = trades.filter(
      (t) => t.emotionalTags?.includes('revenge') || t.tags?.includes('revenge-trading')
    ).length;
    revenge += (revengeTrades / trades.length) * 50;

    return Math.min(100, revenge);
  }

  /**
   * Calculate overconfidence level
   */
  private static calculateOverconfidence(trades: TradeForEmotionalAnalysis[]): number {
    let overconfidence = 0;

    // Check for increasing position sizes after winning streaks
    const winStreaks = EmotionalCalculationEngine.findWinningStreaks(trades);
    let oversizedAfterWins = 0;

    for (const streak of winStreaks) {
      if (streak.length >= 3) {
        const avgSize = EmotionalCalculationEngine.calculateAverageSize(trades);
        const nextTrade = trades[streak.end + 1];
        if (nextTrade && nextTrade.size > avgSize * 1.5) {
          oversizedAfterWins++;
        }
      }
    }

    overconfidence += (oversizedAfterWins / (winStreaks.length || 1)) * 50;

    // Check for overconfidence tags
    const overconfidentTrades = trades.filter(
      (t) => t.emotionalTags?.includes('overconfident') || t.tags?.includes('cocky')
    ).length;
    overconfidence += (overconfidentTrades / trades.length) * 50;

    return Math.min(100, overconfidence);
  }

  // ════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ════════════════════════════════════════════════════════════════════

  private static getRecentTrades(
    trades: TradeForEmotionalAnalysis[],
    days: number
  ): TradeForEmotionalAnalysis[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return trades.filter((t) => t.entryTime >= cutoffDate);
  }

  private static getTradesPerDay(
    trades: TradeForEmotionalAnalysis[]
  ): Record<string, number> {
    const tradesPerDay: Record<string, number> = {};

    for (const trade of trades) {
      const dateKey = trade.entryTime.toISOString().split('T')[0];
      tradesPerDay[dateKey] = (tradesPerDay[dateKey] || 0) + 1;
    }

    return tradesPerDay;
  }

  private static calculateAverageHoldingTime(trades: TradeForEmotionalAnalysis[]): number {
    const holdingTimes = trades
      .filter((t) => t.exitTime)
      .map((t) => (t.exitTime!.getTime() - t.entryTime.getTime()) / (1000 * 60)); // minutes

    return holdingTimes.length > 0
      ? holdingTimes.reduce((sum, time) => sum + time, 0) / holdingTimes.length
      : 0;
  }

  private static getHoldingTime(trade: TradeForEmotionalAnalysis): number {
    if (!trade.exitTime) return 0;
    return (trade.exitTime.getTime() - trade.entryTime.getTime()) / (1000 * 60); // minutes
  }

  private static findLosingStreaks(trades: TradeForEmotionalAnalysis[]): { start: number; end: number; length: number }[] {
    const streaks: { start: number; end: number; length: number }[] = [];
    let currentStreak = { start: -1, end: -1, length: 0 };

    for (let i = 0; i < trades.length; i++) {
      if (trades[i].pnl < 0) {
        if (currentStreak.start === -1) {
          currentStreak.start = i;
        }
        currentStreak.end = i;
        currentStreak.length++;
      } else if (currentStreak.length >= 2) {
        streaks.push({ ...currentStreak });
        currentStreak = { start: -1, end: -1, length: 0 };
      } else {
        currentStreak = { start: -1, end: -1, length: 0 };
      }
    }

    if (currentStreak.length >= 2) {
      streaks.push(currentStreak);
    }

    return streaks;
  }

  private static findWinningStreaks(trades: TradeForEmotionalAnalysis[]): { start: number; end: number; length: number }[] {
    const streaks: { start: number; end: number; length: number }[] = [];
    let currentStreak = { start: -1, end: -1, length: 0 };

    for (let i = 0; i < trades.length; i++) {
      if (trades[i].pnl > 0) {
        if (currentStreak.start === -1) {
          currentStreak.start = i;
        }
        currentStreak.end = i;
        currentStreak.length++;
      } else if (currentStreak.length >= 2) {
        streaks.push({ ...currentStreak });
        currentStreak = { start: -1, end: -1, length: 0 };
      } else {
        currentStreak = { start: -1, end: -1, length: 0 };
      }
    }

    if (currentStreak.length >= 2) {
      streaks.push(currentStreak);
    }

    return streaks;
  }

  private static calculateAverageRiskReward(trades: TradeForEmotionalAnalysis[]): number {
    // Simplified - in production, calculate actual RR from trade data
    return 1.8;
  }

  private static calculatePositionSizeStdDev(trades: TradeForEmotionalAnalysis[]): number {
    const sizes = trades.map((t) => t.size);
    const mean = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const variance =
      sizes.reduce((sum, size) => sum + Math.pow(size - mean, 2), 0) / sizes.length;
    return Math.sqrt(variance);
  }

  private static calculateAverageSize(trades: TradeForEmotionalAnalysis[]): number {
    return trades.reduce((sum, t) => sum + t.size, 0) / trades.length;
  }

  private static calculateWinRate(trades: TradeForEmotionalAnalysis[]): number {
    const winners = trades.filter((t) => t.pnl > 0).length;
    return trades.length > 0 ? (winners / trades.length) * 100 : 0;
  }

  private static calculateConsistency(trades: TradeForEmotionalAnalysis[]): number {
    // Calculate coefficient of variation of returns
    const returns = trades.map((t) => t.pnl);
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
    );

    const cv = Math.abs(mean) > 0 ? stdDev / Math.abs(mean) : 0;
    return Math.max(0, 100 - cv * 50); // Lower CV = higher consistency
  }

  private static determineStatus(score: number): EmotionalState['status'] {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'neutral';
    if (score >= 20) return 'warning';
    return 'critical';
  }

  private static generateInsights(data: any): string[] {
    const insights: string[] = [];

    if (data.revenge > 60) {
      insights.push(
        `⚠️ High revenge trading detected (${data.revenge.toFixed(0)}%). Wait at least 1 hour after a loss before trading again.`
      );
    }

    if (data.discipline < 50) {
      insights.push(
        `📉 Discipline score is low (${data.discipline.toFixed(0)}%). Focus on following your trading plan consistently.`
      );
    }

    if (data.greed > 50) {
      insights.push(
        `💰 Greed levels elevated (${data.greed.toFixed(0)}%). Stick to your position sizing rules.`
      );
    }

    if (data.fear > 50) {
      insights.push(
        `😰 Fear detected (${data.fear.toFixed(0)}%). Trust your strategy and don't exit profitable trades too early.`
      );
    }

    if (data.patience < 40) {
      insights.push(
        '⏳ Patience needs improvement. Quality over quantity - wait for high-probability setups.'
      );
    }

    if (insights.length === 0) {
      insights.push('✅ Your emotional control is good. Keep maintaining discipline!');
    }

    return insights;
  }

  private static generateRecommendation(
    status: EmotionalState['status'],
    insights: string[]
  ): string {
    switch (status) {
      case 'excellent':
        return 'Your emotional state is excellent! Continue with your current approach.';
      case 'good':
        return 'Your trading psychology is healthy. Keep up the good work.';
      case 'neutral':
        return 'Your emotional state is neutral. Focus on the areas highlighted in insights.';
      case 'warning':
        return 'Your emotional state needs attention. Consider taking a break and reviewing your trading plan.';
      case 'critical':
        return '🚨 CRITICAL: Take a break from trading immediately. Your emotional state is affecting your performance.';
      default:
        return 'Continue monitoring your emotional state.';
    }
  }

  private static getDefaultState(): EmotionalState {
    return {
      overall: 50,
      confidence: 50,
      discipline: 50,
      patience: 50,
      emotionalControl: 50,
      riskAwareness: 50,
      fear: 0,
      greed: 0,
      revenge: 0,
      overconfidence: 0,
      status: 'neutral',
      recommendation: 'Not enough data to analyze emotional state. Keep trading to generate insights.',
      insights: [],
    };
  }
}
