import { Trade, FeatureMatrix, Metrics, PatternType } from '../core/types';

export class FeatureExtractor {
  extract(userId: string, profileId: string, trades: Trade[], metrics?: Metrics): FeatureMatrix {
    const timeDistribution: Record<string, number> = {};
    const dayDistribution: Record<string, number> = {};
    const hourlyWinRates: Record<string, number> = {};

    const strategyPerformance: FeatureMatrix['strategyPerformance'] = {};
    const setupPerformance: FeatureMatrix['setupPerformance'] = {};
    const symbolPerformance: FeatureMatrix['symbolPerformance'] = {};
    const symbolCorrelations: FeatureMatrix['symbolCorrelations'] = {};

    const patternFrequencies: Record<PatternType, number> = {} as any;
    const patternCosts: Record<PatternType, number> = {} as any;

    const byHour: Record<string, { wins: number; total: number }> = {};

    for (const trade of trades) {
      const entry = new Date(trade.entry_time);
      const hourLabel = `${entry.getHours()}:00`;
      const dayLabel = entry.toLocaleDateString('en-US', { weekday: 'short' });

      timeDistribution[hourLabel] = (timeDistribution[hourLabel] || 0) + 1;
      dayDistribution[dayLabel] = (dayDistribution[dayLabel] || 0) + 1;

      const key = hourLabel;
      if (!byHour[key]) byHour[key] = { wins: 0, total: 0 };
      byHour[key].total += 1;
      if (trade.pnl > 0) byHour[key].wins += 1;

      if (trade.strategy) {
        const stats = (strategyPerformance[trade.strategy] ||= {
          name: trade.strategy,
          tradeCount: 0,
          winRate: 0,
          avgPnL: 0,
          totalPnL: 0,
          profitFactor: 0,
          avgRR: 0,
          maxDrawdown: 0,
          sharpeRatio: 0,
          consistency: 0,
          isDecaying: false,
        });
        stats.tradeCount += 1;
        stats.totalPnL += trade.pnl;
      }

      if (trade.setup) {
        const setup = (setupPerformance[trade.setup] ||= {
          name: trade.setup,
          tradeCount: 0,
          winRate: 0,
          avgPnL: 0,
          bestSymbols: [],
          bestTimes: [],
        });
        setup.tradeCount += 1;
      }

      const symbolStats = (symbolPerformance[trade.symbol] ||= {
        symbol: trade.symbol,
        tradeCount: 0,
        winRate: 0,
        avgPnL: 0,
        totalPnL: 0,
        avgVolatility: 0,
        bestStrategy: '',
        bestTimeOfDay: '',
      });
      symbolStats.tradeCount += 1;
      symbolStats.totalPnL += trade.pnl;
    }

    // Post-process win rates & averages
    Object.entries(byHour).forEach(([hour, { wins, total }]) => {
      hourlyWinRates[hour] = total ? wins / total : 0;
    });

    Object.values(strategyPerformance).forEach((s) => {
      s.avgPnL = s.tradeCount ? s.totalPnL / s.tradeCount : 0;
      s.winRate = 0; // can be refined later
    });

    Object.values(symbolPerformance).forEach((s) => {
      s.avgPnL = s.tradeCount ? s.totalPnL / s.tradeCount : 0;
      s.winRate = 0;
    });

    const performance = {
      winRate: metrics?.winRate ?? 0,
      profitFactor: metrics?.profitFactor ?? 0,
      avgRR: metrics?.avgRiskReward ?? 0,
      maxDrawdown: metrics?.maxDrawdown ?? 0,
      sharpeRatio: metrics?.sharpeRatio ?? 0,
      consistencyScore: metrics?.consistencyScore ?? 0,
    };

    return {
      timeDistribution,
      dayDistribution,
      hourlyWinRates,
      strategyPerformance,
      setupPerformance,
      symbolPerformance,
      symbolCorrelations,
      performance,
      patternFrequencies,
      patternCosts,
      avgRiskPerTrade: metrics?.avgRiskPerTrade ?? 0,
      ruleViolationRate: metrics ? 1 - (metrics.ruleFollowedRate ?? 0) : 0,
      positionSizeVariance: 0,
      labels: {
        totalProfit: metrics?.totalPnL ?? 0,
        riskAdjustedReturn: metrics?.riskAdjustedReturn ?? 0,
        consistencyScore: metrics?.consistencyScore ?? 0,
      },
    };
  }
}
