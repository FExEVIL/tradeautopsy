// ═══════════════════════════════════════════════════════════════════
// STRATEGY CLASSIFIER - Auto-detect strategy from legs
// ═══════════════════════════════════════════════════════════════════

import { TradeLeg, StrategyClassification, StrategyCategory, RiskType } from '@/types/backtesting';

interface StrategyPattern {
  name: string;
  category: StrategyCategory;
  riskProfile: RiskType;
  matcher: (legs: TradeLeg[]) => boolean;
}

const STRATEGY_PATTERNS: StrategyPattern[] = [
  // Single leg strategies
  {
    name: 'Long Call',
    category: 'bullish',
    riskProfile: 'defined', // Max loss = premium paid
    matcher: (legs) => 
      legs.length === 1 && 
      legs[0].instrumentType === 'call' && 
      legs[0].action === 'buy'
  },
  {
    name: 'Short Call',
    category: 'bearish',
    riskProfile: 'undefined', // Unlimited loss potential
    matcher: (legs) => 
      legs.length === 1 && 
      legs[0].instrumentType === 'call' && 
      legs[0].action === 'sell'
  },
  {
    name: 'Long Put',
    category: 'bearish',
    riskProfile: 'defined', // Max loss = premium paid
    matcher: (legs) => 
      legs.length === 1 && 
      legs[0].instrumentType === 'put' && 
      legs[0].action === 'buy'
  },
  {
    name: 'Short Put',
    category: 'bullish',
    riskProfile: 'undefined', // Unlimited loss potential (down to zero)
    matcher: (legs) => 
      legs.length === 1 && 
      legs[0].instrumentType === 'put' && 
      legs[0].action === 'sell'
  },
  
  // Two-leg strategies
  {
    name: 'Bull Call Spread',
    category: 'bullish',
    riskProfile: 'defined',
    matcher: (legs) => {
      if (legs.length !== 2) return false;
      const calls = legs.filter(l => l.instrumentType === 'call');
      if (calls.length !== 2) return false;
      
      const longCall = calls.find(l => l.action === 'buy');
      const shortCall = calls.find(l => l.action === 'sell');
      
      return !!(longCall && shortCall && 
        longCall.strikePrice && shortCall.strikePrice &&
        longCall.strikePrice < shortCall.strikePrice);
    }
  },
  {
    name: 'Bear Call Spread',
    category: 'bearish',
    riskProfile: 'defined',
    matcher: (legs) => {
      if (legs.length !== 2) return false;
      const calls = legs.filter(l => l.instrumentType === 'call');
      if (calls.length !== 2) return false;
      
      const longCall = calls.find(l => l.action === 'buy');
      const shortCall = calls.find(l => l.action === 'sell');
      
      return !!(longCall && shortCall && 
        longCall.strikePrice && shortCall.strikePrice &&
        longCall.strikePrice > shortCall.strikePrice);
    }
  },
  {
    name: 'Bull Put Spread',
    category: 'bullish',
    riskProfile: 'defined',
    matcher: (legs) => {
      if (legs.length !== 2) return false;
      const puts = legs.filter(l => l.instrumentType === 'put');
      if (puts.length !== 2) return false;
      
      const longPut = puts.find(l => l.action === 'buy');
      const shortPut = puts.find(l => l.action === 'sell');
      
      return !!(longPut && shortPut && 
        longPut.strikePrice && shortPut.strikePrice &&
        longPut.strikePrice < shortPut.strikePrice);
    }
  },
  {
    name: 'Bear Put Spread',
    category: 'bearish',
    riskProfile: 'defined',
    matcher: (legs) => {
      if (legs.length !== 2) return false;
      const puts = legs.filter(l => l.instrumentType === 'put');
      if (puts.length !== 2) return false;
      
      const longPut = puts.find(l => l.action === 'buy');
      const shortPut = puts.find(l => l.action === 'sell');
      
      return !!(longPut && shortPut && 
        longPut.strikePrice && shortPut.strikePrice &&
        longPut.strikePrice > shortPut.strikePrice);
    }
  },
  {
    name: 'Long Straddle',
    category: 'volatile',
    riskProfile: 'defined', // Max loss = premium paid for both legs
    matcher: (legs) => {
      if (legs.length !== 2) return false;
      const call = legs.find(l => l.instrumentType === 'call' && l.action === 'buy');
      const put = legs.find(l => l.instrumentType === 'put' && l.action === 'buy');
      
      return !!(call && put && 
        call.strikePrice === put.strikePrice);
    }
  },
  {
    name: 'Short Straddle',
    category: 'neutral',
    riskProfile: 'undefined',
    matcher: (legs) => {
      if (legs.length !== 2) return false;
      const call = legs.find(l => l.instrumentType === 'call' && l.action === 'sell');
      const put = legs.find(l => l.instrumentType === 'put' && l.action === 'sell');
      
      return !!(call && put && 
        call.strikePrice === put.strikePrice);
    }
  },
  {
    name: 'Long Strangle',
    category: 'volatile',
    riskProfile: 'defined', // Max loss = premium paid for both legs
    matcher: (legs) => {
      if (legs.length !== 2) return false;
      const call = legs.find(l => l.instrumentType === 'call' && l.action === 'buy');
      const put = legs.find(l => l.instrumentType === 'put' && l.action === 'buy');
      
      return !!(call && put && 
        call.strikePrice && put.strikePrice &&
        call.strikePrice !== put.strikePrice);
    }
  },
  {
    name: 'Short Strangle',
    category: 'neutral',
    riskProfile: 'undefined',
    matcher: (legs) => {
      if (legs.length !== 2) return false;
      const call = legs.find(l => l.instrumentType === 'call' && l.action === 'sell');
      const put = legs.find(l => l.instrumentType === 'put' && l.action === 'sell');
      
      return !!(call && put && 
        call.strikePrice && put.strikePrice &&
        call.strikePrice !== put.strikePrice);
    }
  },
  
  // Four-leg strategies
  {
    name: 'Iron Condor',
    category: 'neutral',
    riskProfile: 'defined',
    matcher: (legs) => {
      if (legs.length !== 4) return false;
      
      const calls = legs.filter(l => l.instrumentType === 'call');
      const puts = legs.filter(l => l.instrumentType === 'put');
      
      if (calls.length !== 2 || puts.length !== 2) return false;
      
      const longCall = calls.find(l => l.action === 'buy');
      const shortCall = calls.find(l => l.action === 'sell');
      const longPut = puts.find(l => l.action === 'buy');
      const shortPut = puts.find(l => l.action === 'sell');
      
      return !!(longCall && shortCall && longPut && shortPut &&
        longCall.strikePrice && shortCall.strikePrice &&
        longPut.strikePrice && shortPut.strikePrice &&
        longCall.strikePrice > shortCall.strikePrice &&
        longPut.strikePrice < shortPut.strikePrice);
    }
  },
  {
    name: 'Iron Butterfly',
    category: 'neutral',
    riskProfile: 'defined',
    matcher: (legs) => {
      if (legs.length !== 4) return false;
      
      const calls = legs.filter(l => l.instrumentType === 'call');
      const puts = legs.filter(l => l.instrumentType === 'put');
      
      if (calls.length !== 2 || puts.length !== 2) return false;
      
      const longCall = calls.find(l => l.action === 'buy');
      const shortCall = calls.find(l => l.action === 'sell');
      const longPut = puts.find(l => l.action === 'buy');
      const shortPut = puts.find(l => l.action === 'sell');
      
      return !!(longCall && shortCall && longPut && shortPut &&
        shortCall.strikePrice === shortPut.strikePrice);
    }
  },
];

/**
 * Classify a strategy based on its legs
 */
export function classifyStrategy(legs: TradeLeg[]): StrategyClassification {
  // Try to match against known patterns
  for (const pattern of STRATEGY_PATTERNS) {
    if (pattern.matcher(legs)) {
      return {
        strategyType: 'options',
        strategyName: pattern.name,
        category: pattern.category,
        riskProfile: pattern.riskProfile,
        confidence: 95, // High confidence for exact matches
        legs,
      };
    }
  }
  
  // If no pattern matches, classify as custom
  const category = determineCategory(legs);
  const riskProfile = determineRiskProfile(legs);
  
  return {
    strategyType: 'custom',
    strategyName: 'Custom Strategy',
    category,
    riskProfile,
    confidence: 60, // Lower confidence for custom strategies
    legs,
  };
}

/**
 * Determine strategy category based on net positioning
 */
function determineCategory(legs: TradeLeg[]): StrategyCategory {
  let netCallDelta = 0;
  let netPutDelta = 0;
  
  for (const leg of legs) {
    const multiplier = leg.action === 'buy' ? 1 : -1;
    
    if (leg.instrumentType === 'call') {
      netCallDelta += multiplier * leg.quantity;
    } else if (leg.instrumentType === 'put') {
      netPutDelta += multiplier * leg.quantity;
    }
  }
  
  if (netCallDelta > 0) return 'bullish';
  if (netPutDelta > 0) return 'bearish';
  if (Math.abs(netCallDelta) + Math.abs(netPutDelta) > 0) return 'volatile';
  return 'neutral';
}

/**
 * Determine risk profile based on strategy structure
 */
function determineRiskProfile(legs: TradeLeg[]): RiskType {
  const hasShortOptions = legs.some(l => 
    (l.instrumentType === 'call' || l.instrumentType === 'put') && 
    l.action === 'sell'
  );
  
  const hasLongOptions = legs.some(l => 
    (l.instrumentType === 'call' || l.instrumentType === 'put') && 
    l.action === 'buy'
  );
  
  // If has both long and short options in same direction, likely defined risk
  if (hasShortOptions && hasLongOptions) {
    return 'defined';
  }
  
  // If only short options, undefined risk (unlimited loss potential)
  if (hasShortOptions && !hasLongOptions) {
    return 'undefined';
  }
  
  // If only long options, defined risk (max loss = premium paid)
  // Long options have limited risk because you can only lose the premium paid
  if (hasLongOptions && !hasShortOptions) {
    return 'defined';
  }
  
  // Default to undefined for edge cases
  return 'undefined';
}
