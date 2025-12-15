import { Metrics } from '../core/types';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export interface PositionSizeResult {
  size: number;
  riskFraction: number;
  reasoning: string;
}

export function getOptimalPositionSize(
  stopLossPercent: number,
  accountSize: number,
  metrics: Metrics,
  riskTolerance: RiskTolerance,
): PositionSizeResult {
  const maxRiskPerTrade =
    riskTolerance === 'conservative' ? 0.005 : riskTolerance === 'moderate' ? 0.01 : 0.02;

  const winRate = metrics.winRate || 0.5;
  const rr = metrics.avgRiskReward || 1;

  const kellyFraction = Math.max(0, winRate - (1 - winRate) / Math.max(rr, 0.1));
  const targetRiskFraction = Math.min(kellyFraction / 2, maxRiskPerTrade);

  const riskPerUnit = stopLossPercent / 100;
  const size = riskPerUnit > 0 ? (accountSize * targetRiskFraction) / riskPerUnit : 0;

  return {
    size,
    riskFraction: targetRiskFraction,
    reasoning:
      'Position size based on half-Kelly fraction adjusted for risk tolerance and stop loss distance.',
  };
}
