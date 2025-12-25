/**
 * PnL Calculator Tests
 */

import { calculatePnL, calculateSingleTradePnL, calculateTotalPnL, TradeRow } from '@/lib/pnl-calculator'

describe('PnL Calculator', () => {
  describe('calculatePnL', () => {
    it('should match BUY and SELL pairs correctly', () => {
      const trades: TradeRow[] = [
        {
          trade_date: '2024-01-01',
          symbol: 'NIFTY',
          quantity: 10,
          price: 100,
          trade_type: 'BUY',
          instrument_type: 'EQUITY',
        },
        {
          trade_date: '2024-01-02',
          symbol: 'NIFTY',
          quantity: 10,
          price: 110,
          trade_type: 'SELL',
          instrument_type: 'EQUITY',
        },
      ]

      const result = calculatePnL(trades)

      expect(result).toHaveLength(2)
      expect(result[0].pnl).toBeNull() // BUY trade has no PnL yet
      expect(result[1].pnl).toBe(100) // (110 - 100) * 10
      expect(result[1].net_pnl).toBeLessThan(100) // After charges
    })

    it('should handle FIFO matching for multiple trades', () => {
      const trades: TradeRow[] = [
        {
          trade_date: '2024-01-01',
          symbol: 'NIFTY',
          quantity: 10,
          price: 100,
          trade_type: 'BUY',
          instrument_type: 'EQUITY',
        },
        {
          trade_date: '2024-01-01',
          symbol: 'NIFTY',
          quantity: 5,
          price: 105,
          trade_type: 'BUY',
          instrument_type: 'EQUITY',
        },
        {
          trade_date: '2024-01-02',
          symbol: 'NIFTY',
          quantity: 10,
          price: 110,
          trade_type: 'SELL',
          instrument_type: 'EQUITY',
        },
      ]

      const result = calculatePnL(trades)

      // First SELL should match first BUY (FIFO)
      expect(result[2].entry_price).toBe(100)
      expect(result[2].pnl).toBeGreaterThan(0)
    })

    it('should handle open positions (unmatched BUY)', () => {
      const trades: TradeRow[] = [
        {
          trade_date: '2024-01-01',
          symbol: 'NIFTY',
          quantity: 10,
          price: 100,
          trade_type: 'BUY',
          instrument_type: 'EQUITY',
        },
      ]

      const result = calculatePnL(trades)

      expect(result).toHaveLength(1)
      expect(result[0].pnl).toBeNull() // Open position
      expect(result[0].net_pnl).toBeNull()
    })
  })

  describe('calculateSingleTradePnL', () => {
    it('should calculate PnL for equity trade', () => {
      const result = calculateSingleTradePnL({
        entry_price: 100,
        exit_price: 110,
        quantity: 10,
        instrument_type: 'EQUITY',
      })

      expect(result.pnl).toBeGreaterThan(0)
      expect(result.pnl_percentage).toBeGreaterThan(0)
      expect(result.charges).toBeGreaterThan(0)
    })

    it('should calculate PnL for futures trade', () => {
      const result = calculateSingleTradePnL({
        entry_price: 100,
        exit_price: 110,
        quantity: 10,
        instrument_type: 'FO',
        lot_size: 50,
      })

      expect(result.pnl).toBeGreaterThan(0)
    })

    it('should calculate PnL for options trade', () => {
      const result = calculateSingleTradePnL({
        entry_price: 100,
        exit_price: 110,
        quantity: 1,
        instrument_type: 'OPTIONS',
        lot_size: 50,
      })

      expect(result.pnl).toBeGreaterThan(0)
    })

    it('should handle loss correctly', () => {
      const result = calculateSingleTradePnL({
        entry_price: 100,
        exit_price: 90,
        quantity: 10,
        instrument_type: 'EQUITY',
      })

      expect(result.pnl).toBeLessThan(0)
      expect(result.pnl_percentage).toBeLessThan(0)
    })
  })

  describe('calculateTotalPnL', () => {
    it('should calculate summary statistics', () => {
      const trades = calculatePnL([
        {
          trade_date: '2024-01-01',
          symbol: 'NIFTY',
          quantity: 10,
          price: 100,
          trade_type: 'BUY',
          instrument_type: 'EQUITY',
        },
        {
          trade_date: '2024-01-02',
          symbol: 'NIFTY',
          quantity: 10,
          price: 110,
          trade_type: 'SELL',
          instrument_type: 'EQUITY',
        },
      ])

      const summary = calculateTotalPnL(trades)

      expect(summary.realizedTrades).toBe(1)
      expect(summary.openPositions).toBe(1)
      expect(summary.totalPnL).toBeGreaterThan(0)
      expect(summary.netPnL).toBeGreaterThan(0)
    })
  })
})

