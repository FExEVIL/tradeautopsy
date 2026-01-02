// Sample trades data for demo/onboarding purposes
// 50 realistic Indian market trades with behavioral patterns

export interface SampleTrade {
  trade_date: string
  symbol: string
  quantity: number
  price: number
  pnl: number
  strategy: 'intraday' | 'swing' | 'options' | 'delivery'
  setup?: string
  notes?: string
  tags?: string[]
}

export const sampleTrades: SampleTrade[] = [
  // Week 1 - Mix of wins and losses
  { trade_date: '2024-12-01', symbol: 'NIFTY', quantity: 50, price: 19500, pnl: 2500, strategy: 'intraday', setup: 'Breakout', notes: 'Good entry, held for target', tags: ['nifty', 'breakout'] },
  { trade_date: '2024-12-01', symbol: 'RELIANCE', quantity: 100, price: 2450, pnl: -1200, strategy: 'intraday', setup: 'Reversal', notes: 'Entered too early', tags: ['reliance'] },
  { trade_date: '2024-12-02', symbol: 'BANKNIFTY', quantity: 25, price: 45200, pnl: 1800, strategy: 'options', setup: 'Call', notes: 'Bank Nifty call option', tags: ['banknifty', 'options'] },
  { trade_date: '2024-12-02', symbol: 'TCS', quantity: 50, price: 3850, pnl: -800, strategy: 'swing', setup: 'Trend', notes: 'Swing trade, stopped out', tags: ['tcs', 'swing'] },
  { trade_date: '2024-12-03', symbol: 'INFY', quantity: 75, price: 1520, pnl: 3200, strategy: 'intraday', setup: 'Breakout', notes: 'Strong momentum', tags: ['infy'] },
  { trade_date: '2024-12-03', symbol: 'HDFCBANK', quantity: 50, price: 1680, pnl: -1500, strategy: 'intraday', notes: 'Revenge trade after INFY win', tags: ['hdfc', 'revenge'] },
  { trade_date: '2024-12-03', symbol: 'ICICIBANK', quantity: 100, price: 980, pnl: -2200, strategy: 'intraday', notes: 'Overtrading - 3rd trade of day', tags: ['icici', 'overtrading'] },
  { trade_date: '2024-12-04', symbol: 'NIFTY', quantity: 50, price: 19600, pnl: 1500, strategy: 'intraday', setup: 'Support', notes: 'Bounced from support', tags: ['nifty'] },
  { trade_date: '2024-12-04', symbol: 'WIPRO', quantity: 200, price: 450, pnl: 1800, strategy: 'swing', setup: 'Trend', notes: 'Swing trade working well', tags: ['wipro', 'swing'] },
  { trade_date: '2024-12-05', symbol: 'BANKNIFTY', quantity: 30, price: 45500, pnl: -2500, strategy: 'options', setup: 'Put', notes: 'Put option, wrong direction', tags: ['banknifty', 'options'] },
  
  // Week 2 - More patterns emerge
  { trade_date: '2024-12-08', symbol: 'RELIANCE', quantity: 100, price: 2460, pnl: 2200, strategy: 'intraday', setup: 'Breakout', notes: 'Monday morning trade', tags: ['reliance'] },
  { trade_date: '2024-12-08', symbol: 'TCS', quantity: 50, price: 3860, pnl: 1500, strategy: 'intraday', notes: 'Follow up trade', tags: ['tcs'] },
  { trade_date: '2024-12-08', symbol: 'INFY', quantity: 75, price: 1530, pnl: -1800, strategy: 'intraday', notes: 'Overtrading - 3rd trade', tags: ['infy', 'overtrading'] },
  { trade_date: '2024-12-09', symbol: 'NIFTY', quantity: 50, price: 19700, pnl: 3000, strategy: 'intraday', setup: 'Momentum', notes: 'Strong trend day', tags: ['nifty', 'momentum'] },
  { trade_date: '2024-12-09', symbol: 'HDFCBANK', quantity: 50, price: 1690, pnl: 1200, strategy: 'intraday', notes: 'Good entry', tags: ['hdfc'] },
  { trade_date: '2024-12-10', symbol: 'BANKNIFTY', quantity: 25, price: 45800, pnl: -1500, strategy: 'options', notes: 'Options trade, stopped out early', tags: ['banknifty', 'options'] },
  { trade_date: '2024-12-10', symbol: 'RELIANCE', quantity: 150, price: 2450, pnl: -3500, strategy: 'intraday', notes: 'Revenge sizing after loss', tags: ['reliance', 'revenge-sizing'] },
  { trade_date: '2024-12-11', symbol: 'WIPRO', quantity: 200, price: 455, pnl: 2500, strategy: 'swing', notes: 'Swing trade target hit', tags: ['wipro', 'swing'] },
  { trade_date: '2024-12-11', symbol: 'TCS', quantity: 50, price: 3880, pnl: 1800, strategy: 'intraday', notes: 'Intraday scalp', tags: ['tcs'] },
  { trade_date: '2024-12-12', symbol: 'NIFTY', quantity: 50, price: 19800, pnl: -2000, strategy: 'intraday', notes: 'Friday afternoon trade - weekend warrior', tags: ['nifty', 'weekend-warrior'] },
  
  // Week 3 - More variety
  { trade_date: '2024-12-15', symbol: 'INFY', quantity: 75, price: 1540, pnl: 2800, strategy: 'intraday', setup: 'Breakout', notes: 'Monday breakout', tags: ['infy'] },
  { trade_date: '2024-12-15', symbol: 'HDFCBANK', quantity: 50, price: 1700, pnl: 1500, strategy: 'intraday', notes: 'Follow up trade', tags: ['hdfc'] },
  { trade_date: '2024-12-16', symbol: 'BANKNIFTY', quantity: 25, price: 46000, pnl: 2200, strategy: 'options', setup: 'Call', notes: 'Call option profit', tags: ['banknifty', 'options'] },
  { trade_date: '2024-12-16', symbol: 'RELIANCE', quantity: 100, price: 2470, pnl: -1200, strategy: 'intraday', notes: 'Reversal trade failed', tags: ['reliance'] },
  { trade_date: '2024-12-17', symbol: 'TCS', quantity: 50, price: 3900, pnl: 3200, strategy: 'swing', setup: 'Trend', notes: 'Swing trade working', tags: ['tcs', 'swing'] },
  { trade_date: '2024-12-17', symbol: 'NIFTY', quantity: 50, price: 19900, pnl: -1800, strategy: 'intraday', notes: 'Intraday loss', tags: ['nifty'] },
  { trade_date: '2024-12-18', symbol: 'WIPRO', quantity: 200, price: 460, pnl: 1800, strategy: 'swing', notes: 'Swing trade', tags: ['wipro', 'swing'] },
  { trade_date: '2024-12-18', symbol: 'INFY', quantity: 75, price: 1550, pnl: -2500, strategy: 'intraday', notes: 'FOMO trade - entered late', tags: ['infy', 'fomo'] },
  { trade_date: '2024-12-19', symbol: 'BANKNIFTY', quantity: 30, price: 46200, pnl: -3000, strategy: 'options', notes: 'Options loss', tags: ['banknifty', 'options'] },
  { trade_date: '2024-12-19', symbol: 'RELIANCE', quantity: 200, price: 2460, pnl: -5000, strategy: 'intraday', notes: 'Revenge sizing after big loss', tags: ['reliance', 'revenge-sizing'] },
  
  // Week 4 - Final week
  { trade_date: '2024-12-22', symbol: 'NIFTY', quantity: 50, price: 20000, pnl: 2500, strategy: 'intraday', setup: 'Support', notes: 'Bounce from support', tags: ['nifty'] },
  { trade_date: '2024-12-22', symbol: 'HDFCBANK', quantity: 50, price: 1710, pnl: 1800, strategy: 'intraday', notes: 'Good entry', tags: ['hdfc'] },
  { trade_date: '2024-12-23', symbol: 'TCS', quantity: 50, price: 3920, pnl: 2200, strategy: 'intraday', notes: 'Intraday profit', tags: ['tcs'] },
  { trade_date: '2024-12-23', symbol: 'INFY', quantity: 75, price: 1560, pnl: -1500, strategy: 'intraday', notes: 'Stopped out', tags: ['infy'] },
  { trade_date: '2024-12-24', symbol: 'BANKNIFTY', quantity: 25, price: 46400, pnl: 3000, strategy: 'options', setup: 'Call', notes: 'Options profit', tags: ['banknifty', 'options'] },
  { trade_date: '2024-12-24', symbol: 'RELIANCE', quantity: 100, price: 2480, pnl: 2000, strategy: 'intraday', notes: 'Good trade', tags: ['reliance'] },
  { trade_date: '2024-12-24', symbol: 'WIPRO', quantity: 200, price: 465, pnl: -1200, strategy: 'swing', notes: 'Swing trade stopped out', tags: ['wipro', 'swing'] },
  { trade_date: '2024-12-26', symbol: 'NIFTY', quantity: 50, price: 20100, pnl: 3500, strategy: 'intraday', setup: 'Momentum', notes: 'Strong momentum day', tags: ['nifty', 'momentum'] },
  { trade_date: '2024-12-26', symbol: 'HDFCBANK', quantity: 50, price: 1720, pnl: 2500, strategy: 'intraday', notes: 'Follow up trade', tags: ['hdfc'] },
  { trade_date: '2024-12-27', symbol: 'TCS', quantity: 50, price: 3940, pnl: -2000, strategy: 'intraday', notes: 'Friday afternoon - weekend warrior', tags: ['tcs', 'weekend-warrior'] },
  { trade_date: '2024-12-27', symbol: 'BANKNIFTY', quantity: 30, price: 46600, pnl: -2500, strategy: 'options', notes: 'Options loss on Friday', tags: ['banknifty', 'options', 'weekend-warrior'] },
  { trade_date: '2024-12-28', symbol: 'RELIANCE', quantity: 100, price: 2490, pnl: 2800, strategy: 'intraday', notes: 'Good trade', tags: ['reliance'] },
  { trade_date: '2024-12-28', symbol: 'INFY', quantity: 75, price: 1570, pnl: 2200, strategy: 'intraday', notes: 'Profit taking', tags: ['infy'] },
  { trade_date: '2024-12-29', symbol: 'WIPRO', quantity: 200, price: 470, pnl: 3000, strategy: 'swing', setup: 'Trend', notes: 'Swing trade target hit', tags: ['wipro', 'swing'] },
  { trade_date: '2024-12-29', symbol: 'NIFTY', quantity: 50, price: 20200, pnl: 4000, strategy: 'intraday', setup: 'Breakout', notes: 'Strong breakout trade', tags: ['nifty', 'breakout'] },
  { trade_date: '2024-12-30', symbol: 'HDFCBANK', quantity: 50, price: 1730, pnl: 1800, strategy: 'intraday', notes: 'Final trade of month', tags: ['hdfc'] },
]

// Helper to convert sample trades to database format
export function convertSampleTradesToDBFormat(
  userId: string,
  profileId: string,
  trades: SampleTrade[]
) {
  return trades.map((trade) => ({
    user_id: userId,
    profile_id: profileId,
    trade_date: trade.trade_date,
    symbol: trade.symbol,
    quantity: trade.quantity,
    price: trade.price,
    pnl: trade.pnl,
    strategy: trade.strategy,
    setup: trade.setup || null,
    notes: trade.notes || null,
    tags: trade.tags || [],
    is_sample: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
}

