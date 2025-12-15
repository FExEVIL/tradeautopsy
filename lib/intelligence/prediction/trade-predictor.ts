import { Trade, FeatureMatrix, Metrics, TradePrediction } from '../core/types';
import { getOptimalPositionSize, RiskTolerance } from './position-sizer';

export class TradePredictor {
  predict(
    tradeSetup: Partial<Trade>,
    recentTrades: Trade[],
    features: FeatureMatrix,
    metrics: Metrics,
  ): TradePrediction {
    const baseWinProb = metrics.winRate || 0.5;

    const setupTrades = tradeSetup.setup
      ? recentTrades.filter((t) => t.setup === tradeSetup.setup)
      : [];
    const setupWinProb = setupTrades.length
      ? setupTrades.filter((t) => t.pnl > 0).length / setupTrades.length
      : baseWinProb;

    const symbolTrades = tradeSetup.symbol
      ? recentTrades.filter((t) => t.symbol === tradeSetup.symbol)
      : [];
    const symbolWinProb = symbolTrades.length
      ? symbolTrades.filter((t) => t.pnl > 0).length / symbolTrades.length
      : baseWinProb;

    const winProbability = (setupWinProb + symbolWinProb + baseWinProb) / 3;
    const lossProbability = 1 - winProbability;
    const breakEvenProbability = 0;

    const avgRR = metrics.avgRiskReward || 1;
    const expectedRR = avgRR;
    const avgRisk = metrics.avgRiskPerTrade || 0;
    const expectedPnL = winProbability * avgRisk * expectedRR - lossProbability * avgRisk;

    const riskScore = Math.min(
      100,
      50 + (metrics.maxDrawdownPercent || 0) * 100 - metrics.consistencyScore * 0.2,
    );

    const prediction: TradePrediction = {
      tradeId: tradeSetup.id,
      winProbability,
      lossProbability,
      breakEvenProbability,
      expectedPnL,
      expectedRR,
      riskScore,
      riskFactors: [],
      confidence: 0.6,
      dataQuality: recentTrades.length > 50 ? 0.9 : 0.6,
      similarTrades: [],
      recommendation:
        winProbability > 0.6 && expectedPnL > 0 ? 'take' : winProbability < 0.4 ? 'skip' : 'neutral',
      reasoning: [
        'Prediction based on historical win rates for this symbol/setup and overall account metrics.',
      ],
      createdAt: new Date(),
    };

    return prediction;
  }

  calculateOptimalSize(
    symbol: string,
    stopLossPercent: number,
    accountSize: number,
    metrics: Metrics,
    riskTolerance: RiskTolerance,
  ): { size: number; reasoning: string } {
    const { size, reasoning, riskFraction } = getOptimalPositionSize(
      stopLossPercent,
      accountSize,
      metrics,
      riskTolerance,
    );

    return {
      size,
      reasoning: `${reasoning} Effective risk per trade: ${(riskFraction * 100).toFixed(2)}% of account.`,
    };
  }
}
