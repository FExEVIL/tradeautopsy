import { Trade, Metrics, AdvancedMetrics } from '../core/types';

export class MetricsCalculator {
  calculate(trades: Trade[]): Metrics {
    const now = new Date();
    const periodStart = trades.length ? new Date(trades[trades.length - 1].exit_time) : now;
    const periodEnd = trades.length ? new Date(trades[0].exit_time) : now;

    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.pnl > 0).length;
    const losingTrades = trades.filter((t) => t.pnl < 0).length;
    const breakEvenTrades = trades.filter((t) => t.pnl === 0).length;

    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const grossProfit = trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
    const grossLoss = trades.filter((t) => t.pnl < 0).reduce((s, t) => s + Math.abs(t.pnl), 0);
    const netProfit = totalPnL;

    const avgWin = winningTrades ? grossProfit / winningTrades : 0;
    const avgLoss = losingTrades ? -grossLoss / losingTrades : 0;
    const largestWin = trades.reduce((m, t) => (t.pnl > m ? t.pnl : m), 0);
    const largestLoss = trades.reduce(
      (m, t) => (t.pnl < m ? t.pnl : m),
      0,
    );

    const winRate = totalTrades ? winningTrades / totalTrades : 0;
    const lossRate = totalTrades ? losingTrades / totalTrades : 0;

    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const expectancy =
      winRate * avgWin + lossRate * avgLoss; // avgLoss is negative when present

    // Basic drawdown approximation from cumulative PnL
    let peak = 0;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let equity = 0;
    for (const t of trades.slice().reverse()) {
      equity += t.pnl;
      if (equity > peak) peak = equity;
      const dd = peak - equity;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
        maxDrawdownPercent = peak !== 0 ? (dd / Math.max(Math.abs(peak), 1)) * 100 : 0;
      }
    }

    const avgDrawdown = maxDrawdown / 2;
    const drawdownDuration = trades.length; // placeholder in days
    const recoveryFactor = maxDrawdown > 0 ? netProfit / maxDrawdown : 0;

    // Consistency metrics (very simple approximations)
    const profitableDays = 0;
    const profitableWeeks = 0;
    const profitableMonths = 0;
    const avgDailyPnL = 0;
    const dailyPnLStdDev = 0;

    const { currentStreak, longestWinStreak, longestLossStreak, avgWinStreak, avgLossStreak } =
      this.calculateStreaks(trades);

    // Risk metrics
    const risks = trades
      .map((t) => t.initial_risk)
      .filter((r): r is number => typeof r === 'number' && !Number.isNaN(r));
    const avgRiskPerTrade = risks.length
      ? risks.reduce((s, r) => s + r, 0) / risks.length
      : 0;
    const maxRiskPerTrade = risks.length ? Math.max(...risks) : 0;
    const avgRiskReward = avgRiskPerTrade !== 0 ? (avgWin - avgLoss) / avgRiskPerTrade : 0;

    // Simple risk-adjusted return proxies
    const sharpeRatio = dailyPnLStdDev !== 0 ? avgDailyPnL / dailyPnLStdDev : 0;
    const sortinoRatio = sharpeRatio;
    const calmarRatio = maxDrawdown !== 0 ? netProfit / maxDrawdown : 0;
    const riskAdjustedReturn = sharpeRatio;

    // Time metrics
    const durations = trades.map((t) => t.duration_minutes || 0);
    const avgTradeDuration = durations.length
      ? durations.reduce((s, d) => s + d, 0) / durations.length
      : 0;
    const avgHoldingTime = avgTradeDuration;
    const timeInMarket = 0;

    // Execution quality
    const slippages = trades
      .map((t) => t.slippage)
      .filter((s): s is number => typeof s === 'number' && !Number.isNaN(s));
    const avgSlippage = slippages.length
      ? slippages.reduce((s, d) => s + d, 0) / slippages.length
      : 0;
    const fillRate = 1;

    // Discipline metrics
    const ruleTrades = trades.filter((t) => typeof t.rule_followed === 'boolean');
    const ruleFollowedRate = ruleTrades.length
      ? ruleTrades.filter((t) => t.rule_followed).length / ruleTrades.length
      : 0;
    const planDeviationRate = 1 - ruleFollowedRate;

    // Edge metrics (very rough)
    const edge = expectancy;
    const edgeDecayRate = 0;

    const metrics: Metrics = {
      totalTrades,
      winningTrades,
      losingTrades,
      breakEvenTrades,
      winRate,
      lossRate,
      totalPnL,
      grossProfit,
      grossLoss,
      netProfit,
      avgWin,
      avgLoss,
      largestWin,
      largestLoss,
      profitFactor,
      expectancy,
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      maxDrawdown,
      maxDrawdownPercent,
      avgDrawdown,
      drawdownDuration,
      recoveryFactor,
      consistencyScore: this.calculateConsistencyScore(trades, metricsPlaceholder(winRate, profitFactor)),
      profitableDays,
      profitableWeeks,
      profitableMonths,
      avgDailyPnL,
      dailyPnLStdDev,
      currentStreak,
      longestWinStreak,
      longestLossStreak,
      avgWinStreak,
      avgLossStreak,
      avgRiskReward,
      avgRiskPerTrade,
      maxRiskPerTrade,
      riskAdjustedReturn,
      avgTradeDuration,
      avgHoldingTime,
      timeInMarket,
      avgSlippage,
      fillRate,
      ruleFollowedRate,
      planDeviationRate,
      edge,
      edgeDecayRate,
      periodStart,
      periodEnd,
      calculatedAt: now,
    };

    return metrics;
  }

  calculateAdvanced(trades: Trade[]): AdvancedMetrics {
    const base = this.calculate(trades);

    // Very simple VaR/CVaR approximations from PnL distribution
    const sortedPnL = trades.map((t) => t.pnl).sort((a, b) => a - b);
    const varIndex95 = Math.floor(0.05 * sortedPnL.length);
    const varIndex99 = Math.floor(0.01 * sortedPnL.length);

    const var95 = sortedPnL.length ? Math.abs(sortedPnL[varIndex95] || 0) : 0;
    const var99 = sortedPnL.length ? Math.abs(sortedPnL[varIndex99] || 0) : 0;
    const cvar95 =
      sortedPnL.length && varIndex95 >= 0
        ? Math.abs(
            sortedPnL.slice(0, varIndex95 + 1).reduce((s, p) => s + p, 0) /
              (varIndex95 + 1),
          )
        : 0;

    const rolling7DayReturn = 0;
    const rolling30DayReturn = 0;
    const rolling90DayReturn = 0;

    const attribution = {
      byStrategy: {},
      bySymbol: {},
      byTimeOfDay: {},
      byDayOfWeek: {},
      byMarketCondition: {},
    };

    const pnlValues = trades.map((t) => t.pnl);
    const meanPnL =
      pnlValues.length > 0
        ? pnlValues.reduce((s, p) => s + p, 0) / pnlValues.length
        : 0;
    const stdPnL =
      pnlValues.length > 0
        ? Math.sqrt(
            pnlValues.reduce((s, p) => s + Math.pow(p - meanPnL, 2), 0) /
              pnlValues.length,
          )
        : 0;
    const pnlZScore = stdPnL !== 0 ? meanPnL / stdPnL : 0;

    const winRateZScore = 0;
    const drawdownZScore = 0;

    return {
      ...base,
      var95,
      var99,
      cvar95,
      rolling7DayReturn,
      rolling30DayReturn,
      rolling90DayReturn,
      attribution,
      pnlZScore,
      winRateZScore,
      drawdownZScore,
    };
  }

  updateIncremental(current: Metrics, trade: Trade): Metrics {
    const updated = this.calculate([trade]); // simple placeholder; can be made incremental
    return { ...current, ...updated, calculatedAt: new Date() };
  }

  private calculateStreaks(trades: Trade[]) {
    let currentStreak = 0;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    const streakLengths: number[] = [];

    for (const t of trades) {
      if (t.pnl > 0) {
        currentStreak = currentStreak >= 0 ? currentStreak + 1 : 1;
      } else if (t.pnl < 0) {
        currentStreak = currentStreak <= 0 ? currentStreak - 1 : -1;
      } else {
        streakLengths.push(Math.abs(currentStreak));
        currentStreak = 0;
      }

      longestWinStreak = Math.max(longestWinStreak, currentStreak > 0 ? currentStreak : 0);
      longestLossStreak = Math.max(
        longestLossStreak,
        currentStreak < 0 ? Math.abs(currentStreak) : 0,
      );
    }

    if (currentStreak !== 0) {
      streakLengths.push(Math.abs(currentStreak));
    }

    const winStreaks = streakLengths.filter((s, i) => trades[i].pnl > 0);
    const lossStreaks = streakLengths.filter((s, i) => trades[i].pnl < 0);

    const avgWinStreak = winStreaks.length
      ? winStreaks.reduce((s, v) => s + v, 0) / winStreaks.length
      : 0;
    const avgLossStreak = lossStreaks.length
      ? lossStreaks.reduce((s, v) => s + v, 0) / lossStreaks.length
      : 0;

    return { currentStreak, longestWinStreak, longestLossStreak, avgWinStreak, avgLossStreak };
  }

  private calculateConsistencyScore(trades: Trade[], _placeholder: { winRate: number; profitFactor: number }): number {
    if (trades.length === 0) return 0;
    const dailyPnLByDate: Record<string, number> = {};
    for (const t of trades) {
      const day = new Date(t.exit_time);
      day.setHours(0, 0, 0, 0);
      const key = day.toISOString();
      dailyPnLByDate[key] = (dailyPnLByDate[key] || 0) + t.pnl;
    }
    const values = Object.values(dailyPnLByDate);
    if (!values.length) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance =
      values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    const ratio = std === 0 ? 1 : Math.min(1, Math.max(0, mean / (std * 2)));
    return Math.round(ratio * 100);
  }
}

function metricsPlaceholder(winRate: number, profitFactor: number) {
  return { winRate, profitFactor };
}

