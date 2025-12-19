// ═══════════════════════════════════════════════════════════════════
// GREEKS CALCULATOR - BLACK-SCHOLES MODEL
// ═══════════════════════════════════════════════════════════════════

import { OptionGreeks } from '@/types/backtesting';

// Standard normal cumulative distribution function
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

// Standard normal probability density function
function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Calculate d1 and d2 for Black-Scholes
function calculateD1D2(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number
): { d1: number; d2: number } {
  const d1 = (Math.log(spotPrice / strikePrice) + 
    (riskFreeRate + 0.5 * volatility ** 2) * timeToExpiry) / 
    (volatility * Math.sqrt(timeToExpiry));
  
  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);
  
  return { d1, d2 };
}

/**
 * Calculate option Greeks using Black-Scholes model
 */
export function calculateGreeks(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number, // in years
  riskFreeRate: number, // annual rate (e.g., 0.06 for 6%)
  volatility: number, // annual volatility (e.g., 0.20 for 20%)
  optionType: 'call' | 'put'
): OptionGreeks {
  // Handle edge cases
  if (timeToExpiry <= 0) {
    return {
      delta: optionType === 'call' ? (spotPrice > strikePrice ? 1 : 0) : (spotPrice < strikePrice ? -1 : 0),
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
    };
  }

  const { d1, d2 } = calculateD1D2(spotPrice, strikePrice, timeToExpiry, riskFreeRate, volatility);
  
  // Delta
  const delta = optionType === 'call' 
    ? normalCDF(d1) 
    : normalCDF(d1) - 1;
  
  // Gamma (same for calls and puts)
  const gamma = normalPDF(d1) / (spotPrice * volatility * Math.sqrt(timeToExpiry));
  
  // Theta
  const theta = optionType === 'call'
    ? (-spotPrice * normalPDF(d1) * volatility / (2 * Math.sqrt(timeToExpiry)) - 
       riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2)) / 365
    : (-spotPrice * normalPDF(d1) * volatility / (2 * Math.sqrt(timeToExpiry)) + 
       riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2)) / 365;
  
  // Vega (same for calls and puts, divided by 100 for 1% change)
  const vega = spotPrice * normalPDF(d1) * Math.sqrt(timeToExpiry) / 100;
  
  // Rho (divided by 100 for 1% change)
  const rho = optionType === 'call'
    ? strikePrice * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2) / 100
    : -strikePrice * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2) / 100;
  
  return {
    delta: Number(delta.toFixed(4)),
    gamma: Number(gamma.toFixed(4)),
    theta: Number(theta.toFixed(4)),
    vega: Number(vega.toFixed(4)),
    rho: Number(rho.toFixed(4)),
  };
}

/**
 * Calculate portfolio-level Greeks
 */
export function calculatePortfolioGreeks(legs: Array<{
  greeks: OptionGreeks;
  quantity: number;
  action: 'buy' | 'sell';
}>): {
  totalDelta: number;
  totalGamma: number;
  totalTheta: number;
  totalVega: number;
  netExposure: number;
} {
  let totalDelta = 0;
  let totalGamma = 0;
  let totalTheta = 0;
  let totalVega = 0;
  
  for (const leg of legs) {
    const multiplier = leg.action === 'buy' ? 1 : -1;
    
    totalDelta += leg.greeks.delta * leg.quantity * multiplier;
    totalGamma += leg.greeks.gamma * leg.quantity * multiplier;
    totalTheta += leg.greeks.theta * leg.quantity * multiplier;
    totalVega += leg.greeks.vega * leg.quantity * multiplier;
  }
  
  return {
    totalDelta: Number(totalDelta.toFixed(2)),
    totalGamma: Number(totalGamma.toFixed(4)),
    totalTheta: Number(totalTheta.toFixed(2)),
    totalVega: Number(totalVega.toFixed(2)),
    netExposure: Math.abs(totalDelta),
  };
}

/**
 * Calculate implied volatility using Newton-Raphson method
 */
export function calculateImpliedVolatility(
  marketPrice: number,
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  optionType: 'call' | 'put',
  maxIterations: number = 100,
  tolerance: number = 0.0001
): number {
  let volatility = 0.20; // Initial guess
  
  for (let i = 0; i < maxIterations; i++) {
    const price = calculateOptionPrice(spotPrice, strikePrice, timeToExpiry, riskFreeRate, volatility, optionType);
    const vega = calculateGreeks(spotPrice, strikePrice, timeToExpiry, riskFreeRate, volatility, optionType).vega;
    
    const diff = price - marketPrice;
    
    if (Math.abs(diff) < tolerance) {
      return Number(volatility.toFixed(4));
    }
    
    volatility = volatility - diff / (vega * 100);
    
    // Ensure volatility stays positive
    if (volatility <= 0) {
      volatility = 0.01;
    }
  }
  
  return Number(volatility.toFixed(4));
}

/**
 * Calculate option price using Black-Scholes
 */
export function calculateOptionPrice(
  spotPrice: number,
  strikePrice: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number,
  optionType: 'call' | 'put'
): number {
  const { d1, d2 } = calculateD1D2(spotPrice, strikePrice, timeToExpiry, riskFreeRate, volatility);
  
  if (optionType === 'call') {
    return spotPrice * normalCDF(d1) - strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2);
  } else {
    return strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2) - spotPrice * normalCDF(-d1);
  }
}
