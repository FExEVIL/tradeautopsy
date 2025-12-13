/**
 * Benchmark utilities for comparing portfolio performance vs Nifty 50/Sensex
 */

export type BenchmarkIndex = 'NIFTY_50' | 'SENSEX'

export interface BenchmarkDataPoint {
  date: string
  close: number
  change: number
  changePercent: number
}

export interface BenchmarkComparison {
  portfolioReturn: number
  benchmarkReturn: number
  alpha: number // Excess return over benchmark
  correlation: number
  sharpeRatio?: number
}

// Zerodha instrument tokens for benchmarks
export const BENCHMARK_TOKENS: Record<BenchmarkIndex, number> = {
  NIFTY_50: 256265, // NSE:NIFTY 50
  SENSEX: 265, // BSE:SENSEX
}

// Instrument strings for Kite Connect
export const BENCHMARK_INSTRUMENTS: Record<BenchmarkIndex, string> = {
  NIFTY_50: 'NSE:NIFTY 50',
  SENSEX: 'BSE:SENSEX',
}

/**
 * Calculate portfolio return percentage
 */
export function calculatePortfolioReturn(
  initialValue: number,
  finalValue: number
): number {
  if (initialValue === 0) return 0
  return ((finalValue - initialValue) / initialValue) * 100
}

/**
 * Calculate benchmark return from historical data
 */
export function calculateBenchmarkReturn(
  data: BenchmarkDataPoint[]
): number {
  if (data.length < 2) return 0
  
  const firstClose = data[0].close
  const lastClose = data[data.length - 1].close
  
  return calculatePortfolioReturn(firstClose, lastClose)
}

/**
 * Calculate alpha (excess return over benchmark)
 */
export function calculateAlpha(
  portfolioReturn: number,
  benchmarkReturn: number
): number {
  return portfolioReturn - benchmarkReturn
}

/**
 * Calculate correlation between portfolio and benchmark returns
 */
export function calculateCorrelation(
  portfolioReturns: number[],
  benchmarkReturns: number[]
): number {
  if (portfolioReturns.length !== benchmarkReturns.length || portfolioReturns.length === 0) {
    return 0
  }

  const n = portfolioReturns.length
  const portfolioMean = portfolioReturns.reduce((a, b) => a + b, 0) / n
  const benchmarkMean = benchmarkReturns.reduce((a, b) => a + b, 0) / n

  let numerator = 0
  let portfolioVariance = 0
  let benchmarkVariance = 0

  for (let i = 0; i < n; i++) {
    const portfolioDiff = portfolioReturns[i] - portfolioMean
    const benchmarkDiff = benchmarkReturns[i] - benchmarkMean
    
    numerator += portfolioDiff * benchmarkDiff
    portfolioVariance += portfolioDiff * portfolioDiff
    benchmarkVariance += benchmarkDiff * benchmarkDiff
  }

  const denominator = Math.sqrt(portfolioVariance * benchmarkVariance)
  
  if (denominator === 0) return 0
  
  return numerator / denominator
}

/**
 * Normalize benchmark data to match portfolio date range
 */
export function normalizeBenchmarkData(
  benchmarkData: BenchmarkDataPoint[],
  portfolioDates: string[]
): BenchmarkDataPoint[] {
  const benchmarkMap = new Map(
    benchmarkData.map(point => [point.date, point])
  )

  return portfolioDates
    .map(date => {
      // Find closest benchmark data point
      const exact = benchmarkMap.get(date)
      if (exact) return exact

      // Find nearest date
      const sorted = [...benchmarkData].sort(
        (a, b) => Math.abs(new Date(a.date).getTime() - new Date(date).getTime()) -
                  Math.abs(new Date(b.date).getTime() - new Date(date).getTime())
      )
      return sorted[0]
    })
    .filter(Boolean) as BenchmarkDataPoint[]
}

