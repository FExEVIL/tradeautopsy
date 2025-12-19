// ═══════════════════════════════════════════════════════════════════
// BACKTESTING MODULE - TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

export type InstrumentType = 'call' | 'put' | 'stock' | 'future';
export type OptionAction = 'buy' | 'sell';
export type StrikeSelection = 'ATM' | 'OTM' | 'ITM';
export type StrategyCategory = 'bullish' | 'bearish' | 'neutral' | 'volatile';
export type RiskType = 'defined' | 'undefined';

// Strategy Leg
export interface TradeLeg {
  id?: string;
  legNumber: number;
  instrumentType: InstrumentType;
  action: OptionAction;
  strikePrice?: number;
  expiryDate?: Date | string;
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  premium: number;
  
  // Greeks
  greeks?: OptionGreeks;
}

// Option Greeks
export interface OptionGreeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho?: number;
  impliedVolatility?: number;
}

// Portfolio Greeks
export interface PortfolioGreeks {
  totalDelta: number;
  totalGamma: number;
  totalTheta: number;
  totalVega: number;
  netExposure: number;
}

// Strategy Template
export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: StrategyCategory;
  riskType: RiskType;
  minLegs: number;
  maxLegs: number;
  typicalStructure: any;
  exampleImageUrl?: string;
}

// Strategy Classification
export interface StrategyClassification {
  strategyType: string;
  strategyName: string;
  category: StrategyCategory;
  riskProfile: RiskType;
  confidence: number; // 0-100
  legs: TradeLeg[];
}

// Payoff Calculation
export interface PayoffPoint {
  underlyingPrice: number;
  pnl: number;
  probability?: number;
}

export interface PayoffDiagram {
  points: PayoffPoint[];
  maxProfit: number;
  maxLoss: number;
  breakevens: number[];
  currentPrice: number;
  currentPnL: number;
  riskRewardRatio: number;
}

// Backtest Configuration
export interface BacktestConfig {
  id?: string;
  name: string;
  
  // Strategy
  strategyTemplateId?: string;
  strategyName: string;
  legsConfig: TradeLeg[];
  
  // Basic params
  symbol: string;
  startDate: Date | string;
  endDate: Date | string;
  initialCapital: number;
  
  // Entry rules
  entryRules: {
    daysToExpiry: number;
    strikeSelection: StrikeSelection;
    deltaTarget?: number;
    entryTime?: string;
    minPremium?: number;
    maxPremium?: number;
  };
  
  // Exit rules
  exitRules: {
    targetProfitPct?: number;
    stopLossPct?: number;
    daysToExpiry?: number;
    exitTime?: string;
    trailingStopPct?: number;
  };
  
  // Advanced
  commissionPerLeg?: number;
  slippagePct?: number;
}

// Backtest Result
export interface BacktestResult {
  id: string;
  configId: string;
  
  // Summary
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  
  // P&L
  totalPnL: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  
  // Risk
  maxDrawdown: number;
  maxDrawdownPct: number;
  profitFactor: number;
  sharpeRatio: number;
  
  // Additional
  avgTradeDuration: number;
  totalCommissions: number;
  finalCapital: number;
  returnPct: number;
  
  // Detailed
  equityCurve: { date: Date | string; equity: number }[];
  tradeDetails: BacktestedTrade[];
  monthlyReturns: Record<string, number>;
  
  status: 'pending' | 'running' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date | string;
  completedAt?: Date | string;
}

// Individual backtested trade
export interface BacktestedTrade {
  entryDate: Date | string;
  exitDate: Date | string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPct: number;
  durationDays: number;
  legs: TradeLeg[];
}

// Option Chain Data
export interface OptionChainStrike {
  strike: number;
  
  // Call data
  callBid: number;
  callAsk: number;
  callLTP: number;
  callVolume: number;
  callOI: number;
  callOIChange: number;
  callIV: number;
  callDelta: number;
  callGamma: number;
  callTheta: number;
  callVega: number;
  
  // Put data
  putBid: number;
  putAsk: number;
  putLTP: number;
  putVolume: number;
  putOI: number;
  putOIChange: number;
  putIV: number;
  putDelta: number;
  putGamma: number;
  putTheta: number;
  putVega: number;
}

export interface OptionChainData {
  symbol: string;
  spotPrice: number;
  expiryDate: Date | string;
  strikes: OptionChainStrike[];
  putCallRatio: number;
  maxPain: number;
  totalCallOI: number;
  totalPutOI: number;
}
