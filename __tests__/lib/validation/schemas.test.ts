/**
 * Validation Schema Tests
 */

import { z } from 'zod'

// Example schema tests - replace with actual schemas from your codebase
describe('Validation Schemas', () => {
  describe('Trade Schema', () => {
    const tradeSchema = z.object({
      symbol: z.string().min(1),
      quantity: z.number().positive(),
      price: z.number().positive(),
      side: z.enum(['BUY', 'SELL']),
    })

    it('should validate valid trade data', () => {
      const validTrade = {
        symbol: 'NIFTY',
        quantity: 100,
        price: 15000,
        side: 'BUY' as const,
      }

      expect(() => tradeSchema.parse(validTrade)).not.toThrow()
    })

    it('should reject invalid symbol', () => {
      const invalidTrade = {
        symbol: '',
        quantity: 100,
        price: 15000,
        side: 'BUY' as const,
      }

      expect(() => tradeSchema.parse(invalidTrade)).toThrow()
    })

    it('should reject negative quantity', () => {
      const invalidTrade = {
        symbol: 'NIFTY',
        quantity: -100,
        price: 15000,
        side: 'BUY' as const,
      }

      expect(() => tradeSchema.parse(invalidTrade)).toThrow()
    })

    it('should reject invalid side', () => {
      const invalidTrade = {
        symbol: 'NIFTY',
        quantity: 100,
        price: 15000,
        side: 'INVALID' as any,
      }

      expect(() => tradeSchema.parse(invalidTrade)).toThrow()
    })
  })

  describe('Email Schema', () => {
    const emailSchema = z.string().email()

    it('should validate valid email', () => {
      expect(() => emailSchema.parse('test@example.com')).not.toThrow()
    })

    it('should reject invalid email', () => {
      expect(() => emailSchema.parse('invalid-email')).toThrow()
      expect(() => emailSchema.parse('@example.com')).toThrow()
      expect(() => emailSchema.parse('test@')).toThrow()
    })
  })
})

