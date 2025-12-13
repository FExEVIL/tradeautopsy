/**
 * P&L Calculator
 * Automatically calculates P&L by matching BUY/SELL pairs
 */

export interface TradeRow {
  trade_date: string;
  symbol: string;
  quantity: number;
  price: number;
  trade_type: 'BUY' | 'SELL';
  instrument_type: 'EQUITY' | 'FO' | 'OPTIONS';
  lot_size?: number;
  segment?: string;
}

export interface TradeWithPnL extends TradeRow {
  pnl: number | null;
  charges: number;
  net_pnl: number | null;
  exit_price?: number;
  entry_price?: number;
}

/**
 * Calculate P&L for trades by matching BUY/SELL pairs
 */
export function calculatePnL(trades: TradeRow[]): TradeWithPnL[] {
  // Sort trades by date (FIFO - First In First Out)
  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = new Date(a.trade_date).getTime();
    const dateB = new Date(b.trade_date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    // If same date, BUY comes before SELL
    if (a.trade_type === 'BUY' && b.trade_type === 'SELL') return -1;
    if (a.trade_type === 'SELL' && b.trade_type === 'BUY') return 1;
    return 0;
  });
  
  const tradesWithPnL: TradeWithPnL[] = [];
  // Map to track open positions: symbol -> array of BUY trades
  const openPositions = new Map<string, TradeRow[]>();
  
  for (const trade of sortedTrades) {
    const key = trade.symbol;
    
    if (trade.trade_type === 'BUY') {
      // Add to open positions
      if (!openPositions.has(key)) {
        openPositions.set(key, []);
      }
      openPositions.get(key)!.push(trade);
      
      // BUY trade - no P&L yet (open position)
      tradesWithPnL.push({
        ...trade,
        pnl: null,
        charges: calculateCharges(trade),
        net_pnl: null,
        entry_price: trade.price,
      });
      
    } else if (trade.trade_type === 'SELL') {
      // Try to match with a BUY trade
      const buyTrades = openPositions.get(key) || [];
      
      if (buyTrades.length > 0) {
        // Match with oldest BUY trade (FIFO)
        const buyTrade = buyTrades.shift()!;
        const priceDiff = trade.price - buyTrade.price;
        const quantity = Math.min(trade.quantity, buyTrade.quantity);
        const lotSize = trade.lot_size || buyTrade.lot_size || 1;
        
        // Calculate gross P&L based on instrument type
        let grossPnL: number;
        
        if (trade.instrument_type === 'EQUITY') {
          // Equity: (Sell Price - Buy Price) * Quantity
          grossPnL = priceDiff * quantity;
        } else if (trade.instrument_type === 'FO') {
          // Futures: (Sell Price - Buy Price) * Quantity * Lot Size
          grossPnL = priceDiff * quantity * lotSize;
        } else if (trade.instrument_type === 'OPTIONS') {
          // Options: (Sell Price - Buy Price) * Lot Size
          grossPnL = priceDiff * lotSize;
        } else {
          // Default to equity calculation
          grossPnL = priceDiff * quantity;
        }
        
        // Calculate total charges (buy + sell)
        const buyCharges = calculateCharges(buyTrade);
        const sellCharges = calculateCharges(trade);
        const totalCharges = buyCharges + sellCharges;
        
        // Net P&L = Gross P&L - Charges
        const netPnL = grossPnL - totalCharges;
        
        tradesWithPnL.push({
          ...trade,
          pnl: parseFloat(grossPnL.toFixed(2)),
          charges: parseFloat(sellCharges.toFixed(2)),
          net_pnl: parseFloat(netPnL.toFixed(2)),
          entry_price: buyTrade.price,
          exit_price: trade.price,
        });
        
        // If there's remaining quantity in the BUY trade, put it back
        if (buyTrade.quantity > quantity) {
          buyTrades.unshift({
            ...buyTrade,
            quantity: buyTrade.quantity - quantity,
          });
        }
        
        // Clean up if no more open positions
        if (buyTrades.length === 0) {
          openPositions.delete(key);
        }
        
      } else {
        // No matching BUY trade - this is a short sell (open position)
        tradesWithPnL.push({
          ...trade,
          pnl: null,
          charges: calculateCharges(trade),
          net_pnl: null,
          exit_price: trade.price,
        });
      }
    }
  }
  
  return tradesWithPnL;
}

/**
 * Calculate trading charges for a trade
 */
function calculateCharges(trade: TradeRow): number {
  const tradeValue = trade.price * trade.quantity;
  const lotSize = trade.lot_size || 1;
  const adjustedValue = trade.instrument_type === 'OPTIONS' 
    ? trade.price * lotSize 
    : tradeValue;
  
  // Brokerage (0.03% or ₹20 per order, whichever is lower)
  const brokerage = Math.min(adjustedValue * 0.0003, 20);
  
  // STT (Securities Transaction Tax) - 0.1% on sell side
  const stt = trade.trade_type === 'SELL' ? adjustedValue * 0.001 : 0;
  
  // Transaction charges (0.00325% of trade value)
  const transactionCharges = adjustedValue * 0.0000325;
  
  // GST (18% on brokerage + transaction charges)
  const gst = (brokerage + transactionCharges) * 0.18;
  
  // Stamp duty (0.003% on buy side)
  const stampDuty = trade.trade_type === 'BUY' ? adjustedValue * 0.00003 : 0;
  
  const totalCharges = brokerage + stt + transactionCharges + gst + stampDuty;
  return parseFloat(totalCharges.toFixed(2));
}

/**
 * Calculate summary statistics for trades
 */
export function calculateTotalPnL(trades: TradeWithPnL[]): {
  totalPnL: number;
  totalCharges: number;
  netPnL: number;
  realizedTrades: number;
  openPositions: number;
} {
  const realizedTrades = trades.filter(t => t.net_pnl !== null);
  const totalPnL = realizedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalCharges = trades.reduce((sum, t) => sum + t.charges, 0);
  const netPnL = realizedTrades.reduce((sum, t) => sum + (t.net_pnl || 0), 0);
  const openPositions = trades.filter(t => t.net_pnl === null).length;
  
  return {
    totalPnL: parseFloat(totalPnL.toFixed(2)),
    totalCharges: parseFloat(totalCharges.toFixed(2)),
    netPnL: parseFloat(netPnL.toFixed(2)),
    realizedTrades: realizedTrades.length,
    openPositions: openPositions,
  };
}

/**
 * Legacy compatibility functions for existing JSON import
 */
export interface TradeData {
  symbol: string;
  quantity: number;
  price: number;
  trade_type: 'BUY' | 'SELL';
  instrument_type: 'EQUITY' | 'FO' | 'OPTIONS';
  lot_size?: number;
  charges?: number;
  trade_date: string;
  trade_id?: string;
  product?: string;
}

export function processTradesWithPnL(trades: TradeData[]): Array<TradeData & { pnl: number; pnl_percentage: number; charges: number }> {
  // Convert to TradeRow format
  const tradeRows: TradeRow[] = trades.map(t => ({
    trade_date: t.trade_date,
    symbol: t.symbol,
    quantity: t.quantity,
    price: t.price,
    trade_type: t.trade_type,
    instrument_type: t.instrument_type,
    lot_size: t.lot_size,
  }));

  // Calculate P&L
  const tradesWithPnL = calculatePnL(tradeRows);

  // Map back to TradeData format
  return trades.map((trade, index) => {
    const calculated = tradesWithPnL[index];
    const pnl = calculated?.net_pnl || 0;
    const charges = calculated?.charges || trade.charges || 0;
    const pnlPercentage = trade.price > 0 ? (pnl / (trade.price * trade.quantity)) * 100 : 0;

    return {
      ...trade,
      pnl: parseFloat(pnl.toFixed(2)),
      pnl_percentage: parseFloat(pnlPercentage.toFixed(2)),
      charges: parseFloat(charges.toFixed(2)),
    };
  });
}

export function calculateSingleTradePnL(params: {
  entry_price: number;
  exit_price: number;
  quantity: number;
  instrument_type?: string;
  lot_size?: number;
  product?: string;
}): { pnl: number; pnl_percentage: number; charges: number } {
  const priceDiff = params.exit_price - params.entry_price;
  const quantity = params.quantity;
  const lotSize = params.lot_size || 1;
  const instrumentType = (params.instrument_type || 'EQUITY') as 'EQUITY' | 'FO' | 'OPTIONS';

  let grossPnL: number;
  if (instrumentType === 'EQUITY') {
    grossPnL = priceDiff * quantity;
  } else if (instrumentType === 'FO') {
    grossPnL = priceDiff * quantity * lotSize;
  } else if (instrumentType === 'OPTIONS') {
    grossPnL = priceDiff * lotSize;
  } else {
    grossPnL = priceDiff * quantity;
  }

  // Calculate charges
  const tradeValue = params.exit_price * quantity;
  const adjustedValue = instrumentType === 'OPTIONS' ? params.exit_price * lotSize : tradeValue;
  const brokerage = Math.min(adjustedValue * 0.0003, 20);
  const stt = adjustedValue * 0.001;
  const transactionCharges = adjustedValue * 0.0000325;
  const gst = (brokerage + transactionCharges) * 0.18;
  const stampDuty = adjustedValue * 0.00003;
  const totalCharges = brokerage + stt + transactionCharges + gst + stampDuty;

  const netPnL = grossPnL - totalCharges;
  const pnlPercentage = params.entry_price > 0 ? (netPnL / (params.entry_price * quantity)) * 100 : 0;

  return {
    pnl: parseFloat(netPnL.toFixed(2)),
    pnl_percentage: parseFloat(pnlPercentage.toFixed(2)),
    charges: parseFloat(totalCharges.toFixed(2)),
  };
}
