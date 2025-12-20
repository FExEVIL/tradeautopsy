/**
 * Currency Utility Tests
 */

import {
  formatCurrency,
  formatCompact,
  formatPnL,
  formatPercentage,
  parseCurrency,
} from '@/lib/utils/currency'

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers', () => {
      expect(formatCurrency(123456.78)).toBe('₹1,23,456.78')
    })

    it('should format negative numbers', () => {
      expect(formatCurrency(-123456.78)).toBe('-₹1,23,456.78')
    })

    it('should handle null and undefined', () => {
      expect(formatCurrency(null)).toBe('₹0')
      expect(formatCurrency(undefined)).toBe('₹0')
    })

    it('should format with custom decimals', () => {
      expect(formatCurrency(1234.5, { decimals: 0 })).toBe('₹1,235')
    })

    it('should format compact notation', () => {
      expect(formatCurrency(1234567, { compact: true })).toContain('Cr')
    })
  })

  describe('formatCompact', () => {
    it('should format crores', () => {
      expect(formatCompact(10000000)).toBe('1.00Cr')
    })

    it('should format lakhs', () => {
      expect(formatCompact(100000)).toBe('1.00L')
    })

    it('should format thousands', () => {
      expect(formatCompact(5000)).toBe('5.0K')
    })
  })

  describe('formatPnL', () => {
    it('should return green for profit', () => {
      const result = formatPnL(1000)
      expect(result.isPositive).toBe(true)
      expect(result.colorClass).toBe('text-green-400')
    })

    it('should return red for loss', () => {
      const result = formatPnL(-1000)
      expect(result.isPositive).toBe(false)
      expect(result.colorClass).toBe('text-red-400')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentages', () => {
      expect(formatPercentage(50.5)).toBe('50.50%')
    })

    it('should handle negative percentages', () => {
      expect(formatPercentage(-10.5)).toBe('-10.50%')
    })
  })

  describe('parseCurrency', () => {
    it('should parse crores', () => {
      expect(parseCurrency('₹1.5Cr')).toBe(15000000)
    })

    it('should parse lakhs', () => {
      expect(parseCurrency('₹2.5L')).toBe(250000)
    })

    it('should parse thousands', () => {
      expect(parseCurrency('₹5K')).toBe(5000)
    })

    it('should parse regular format', () => {
      expect(parseCurrency('₹1,23,456.78')).toBe(123456.78)
    })
  })
})

