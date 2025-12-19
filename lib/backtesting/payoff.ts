// ═══════════════════════════════════════════════════════════════════
// PAYOFF CALCULATOR
// ═══════════════════════════════════════════════════════════════════

import { TradeLeg, PayoffDiagram, PayoffPoint } from '@/types/backtesting';

// Standard normal cumulative distribution function (from greeks.ts)
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

/**
 * Calculate P&L for a single option leg at given underlying price
 */
function calculateLegPayoff(
  leg: TradeLeg,
  underlyingPrice: number
): number {
  const { instrumentType, action, strikePrice, quantity, entryPrice } = leg;
  
  if (!strikePrice) return 0;
  
  let intrinsicValue = 0;
  
  if (instrumentType === 'call') {
    intrinsicValue = Math.max(0, underlyingPrice - strikePrice);
  } else if (instrumentType === 'put') {
    intrinsicValue = Math.max(0, strikePrice - underlyingPrice);
  } else if (instrumentType === 'stock') {
    intrinsicValue = underlyingPrice;
  }
  
  // Calculate P&L
  const multiplier = action === 'buy' ? 1 : -1;
  const currentValue = intrinsicValue;
  const costBasis = entryPrice;
  
  return (currentValue - costBasis) * quantity * multiplier;
}

/**
 * Calculate complete payoff diagram for a strategy
 */
export function calculatePayoff(
  legs: TradeLeg[],
  currentPrice: number,
  priceRange?: { min: number; max: number; step: number }
): PayoffDiagram {
  // Auto-calculate price range if not provided
  if (!priceRange) {
    const strikes = legs
      .map(l => l.strikePrice)
      .filter((s): s is number => s !== undefined);
    
    if (strikes.length === 0) {
      // Default range if no strikes
      priceRange = {
        min: currentPrice * 0.7,
        max: currentPrice * 1.3,
        step: currentPrice * 0.01,
      };
    } else {
      const minStrike = Math.min(...strikes, currentPrice);
      const maxStrike = Math.max(...strikes, currentPrice);
      
      const range = maxStrike - minStrike;
      priceRange = {
        min: Math.floor(minStrike - range * 0.2),
        max: Math.ceil(maxStrike + range * 0.2),
        step: Math.max(1, Math.ceil(range / 100)),
      };
    }
  }
  
  const points: PayoffPoint[] = [];
  
  // Calculate P&L at each price point
  for (let price = priceRange.min; price <= priceRange.max; price += priceRange.step) {
    let totalPnL = 0;
    
    for (const leg of legs) {
      totalPnL += calculateLegPayoff(leg, price);
    }
    
    points.push({
      underlyingPrice: price,
      pnl: Number(totalPnL.toFixed(2)),
    });
  }
  
  // Find breakeven points
  const breakevens = findBreakevens(points);
  
  // Calculate current P&L
  const currentPnL = points.find(p => 
    Math.abs(p.underlyingPrice - currentPrice) < priceRange.step
  )?.pnl || 0;
  
  // Find max profit and loss
  const maxProfit = Math.max(...points.map(p => p.pnl));
  const maxLoss = Math.min(...points.map(p => p.pnl));
  
  // Calculate risk-reward ratio
  const riskRewardRatio = maxLoss !== 0 
    ? Number((Math.abs(maxProfit) / Math.abs(maxLoss)).toFixed(2))
    : 0;
  
  return {
    points,
    maxProfit: Number(maxProfit.toFixed(2)),
    maxLoss: Number(maxLoss.toFixed(2)),
    breakevens,
    currentPrice,
    currentPnL: Number(currentPnL.toFixed(2)),
    riskRewardRatio,
  };
}

/**
 * Find breakeven points where P&L crosses zero
 */
function findBreakevens(points: PayoffPoint[]): number[] {
  const breakevens: number[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    
    // Check if P&L crosses zero
    if ((current.pnl <= 0 && next.pnl >= 0) || (current.pnl >= 0 && next.pnl <= 0)) {
      // Linear interpolation to find exact breakeven
      const slope = (next.pnl - current.pnl) / (next.underlyingPrice - current.underlyingPrice);
      if (slope !== 0) {
        const breakeven = current.underlyingPrice - current.pnl / slope;
        breakevens.push(Number(breakeven.toFixed(2)));
      }
    }
  }
  
  return breakevens;
}

/**
 * Calculate probability of profit (simplified)
 */
export function calculateProbabilityOfProfit(
  payoff: PayoffDiagram,
  currentPrice: number,
  impliedVolatility: number,
  daysToExpiry: number
): number {
  // Simplified calculation based on breakevens and IV
  // In production, use Monte Carlo simulation for accuracy
  
  const breakevens = payoff.breakevens;
  if (breakevens.length === 0) return 0;
  
  // Calculate standard deviation of price movement
  const timeToExpiry = daysToExpiry / 365;
  const stdDev = currentPrice * impliedVolatility * Math.sqrt(timeToExpiry);
  
  // Calculate probability that price stays between breakevens
  // This is a simplified calculation
  let probability = 0;
  
  if (breakevens.length === 2) {
    const lowerBreakeven = breakevens[0];
    const upperBreakeven = breakevens[1];
    
    const zLower = (lowerBreakeven - currentPrice) / stdDev;
    const zUpper = (upperBreakeven - currentPrice) / stdDev;
    
    // Using normal distribution
    probability = normalCDF(zUpper) - normalCDF(zLower);
  }
  
  return Number((probability * 100).toFixed(2));
}
