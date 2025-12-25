/**
 * Unit Tests: Formatters
 * 
 * Tests for currency, number, and date formatting utilities
 */

import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatCompact,
  formatPnL,
  formatPercentage,
  parseCurrency,
} from '@/lib/utils/currency'

describe('Currency Formatters', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers with currency symbol', () => {
      expect(formatCurrency(1000)).toBe('₹1,000.00')
      expect(formatCurrency(1000, { decimals: 0 })).toBe('₹1,000')
      expect(formatCurrency(100000)).toBe('₹1,00,000.00')
      expect(formatCurrency(10000000)).toBe('₹1,00,00,000.00')
    })

    it('should format negative numbers with minus sign', () => {
      expect(formatCurrency(-1000)).toBe('-₹1,000.00')
      expect(formatCurrency(-1000, { decimals: 0 })).toBe('-₹1,000')
      expect(formatCurrency(-50000)).toBe('-₹50,000.00')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('₹0.00')
      expect(formatCurrency(0, { decimals: 0 })).toBe('₹0')
    })

    it('should handle decimal values', () => {
      expect(formatCurrency(1234.56)).toBe('₹1,234.56')
      expect(formatCurrency(0.5)).toBe('₹0.50')
    })

    it('should respect decimal options', () => {
      expect(formatCurrency(1000, { decimals: 0 })).toBe('₹1,000')
      expect(formatCurrency(1000.5, { decimals: 2 })).toBe('₹1,000.50')
    })
  })

  describe('formatCompact', () => {
    it('should format large numbers in compact notation', () => {
      // formatCompact returns just the number part, not with currency symbol
      expect(formatCompact(1000)).toBe('1.0K')
      expect(formatCompact(1000000)).toBe('10.00L')
      expect(formatCompact(10000000)).toBe('1.00Cr')
    })

    it('should handle negative numbers', () => {
      // formatCompact uses Math.abs, so negative numbers become positive
      expect(formatCompact(-1000)).toBe('1.0K')
      expect(formatCompact(-1000000)).toBe('10.00L')
    })
  })

  describe('formatPnL', () => {
    it('should format profit with green indicator', () => {
      const result = formatPnL(5000)
      expect(result.formatted).toBe('₹5,000.00')
      expect(result.isPositive).toBe(true)
      expect(result.colorClass).toContain('green')
    })

    it('should format loss with red indicator', () => {
      const result = formatPnL(-3000)
      expect(result.formatted).toBe('-₹3,000.00')
      expect(result.isPositive).toBe(false)
      expect(result.colorClass).toContain('red')
    })

    it('should handle zero PnL', () => {
      const result = formatPnL(0)
      expect(result.formatted).toBe('₹0.00')
      expect(result.isPositive).toBe(false)
    })
  })

  describe('formatPercentage', () => {
    it('should format positive percentages', () => {
      expect(formatPercentage(10.5, { showSign: true })).toBe('+10.50%')
      expect(formatPercentage(5, { showSign: true })).toBe('+5.00%')
      // Without showSign, no + prefix
      expect(formatPercentage(10.5)).toBe('10.50%')
    })

    it('should format negative percentages', () => {
      // formatPercentage uses Math.abs, so negatives become positive
      expect(formatPercentage(-10.5)).toBe('10.50%')
      expect(formatPercentage(-5)).toBe('5.00%')
    })

    it('should handle zero percentage', () => {
      expect(formatPercentage(0)).toBe('0.00%')
    })
  })

  describe('parseCurrency', () => {
    it('should parse currency strings to numbers', () => {
      expect(parseCurrency('₹1,000')).toBe(1000)
      expect(parseCurrency('₹1,00,000')).toBe(100000)
      expect(parseCurrency('1,000')).toBe(1000)
    })

    it('should handle negative values', () => {
      expect(parseCurrency('-₹1,000')).toBe(-1000)
      expect(parseCurrency('-1,000')).toBe(-1000)
    })

    it('should handle decimal values', () => {
      expect(parseCurrency('₹1,234.56')).toBe(1234.56)
      expect(parseCurrency('1,234.56')).toBe(1234.56)
    })

    it('should return 0 for invalid input', () => {
      expect(parseCurrency('invalid')).toBe(0)
      expect(parseCurrency('')).toBe(0)
    })
  })
})

