/**
 * Unit Tests: Error Utilities
 * 
 * Tests for error handling and retry logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withRetry, AppError } from '@/lib/utils/errors'

describe('Error Utilities', () => {
  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    it('should return result on first successful attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success')
      
      const result = await withRetry(operation)
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and succeed', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce('success')
      
      const promise = withRetry(operation, { maxAttempts: 3, delayMs: 100 })
      
      // Fast-forward time to allow retry
      await vi.advanceTimersByTimeAsync(200)
      
      const result = await promise
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(2)
    })

    it('should fail after max attempts', async () => {
      const error = new Error('Persistent error')
      const operation = vi.fn().mockRejectedValue(error)
      
      const promise = withRetry(operation, { maxAttempts: 3, delayMs: 100 })
      
      // Fast-forward time to allow all retries
      await vi.advanceTimersByTimeAsync(500)
      
      // Wait for promise to settle
      try {
        await promise
        expect.fail('Should have thrown error')
      } catch (e) {
        expect(e).toBe(error)
      }
      
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should not retry on validation errors', async () => {
      // Create an actual AppError instance with VALIDATION_ERROR code
      const error = new AppError('Invalid input', { code: 'VALIDATION_ERROR' })
      const operation = vi.fn().mockRejectedValue(error)
      
      // Don't use fake timers for this test - it causes issues with error handling
      vi.useRealTimers()
      
      await expect(withRetry(operation, { maxAttempts: 3 })).rejects.toThrow('Invalid input')
      expect(operation).toHaveBeenCalledTimes(1)
      
      // Restore fake timers
      vi.useFakeTimers()
    })

    it('should use exponential backoff', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce('success')
      
      const promise = withRetry(operation, {
        maxAttempts: 3,
        delayMs: 100,
        backoffMultiplier: 2,
      })
      
      // First retry after 100ms
      await vi.advanceTimersByTimeAsync(100)
      // Second retry after 200ms (100 * 2)
      await vi.advanceTimersByTimeAsync(200)
      
      const result = await promise
      
      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should respect max delay', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce('success')
      
      const promise = withRetry(operation, {
        maxAttempts: 2,
        delayMs: 1000,
        backoffMultiplier: 10,
        maxDelayMs: 2000,
      })
      
      // Should cap at 2000ms, not 10000ms
      await vi.advanceTimersByTimeAsync(2000)
      
      const result = await promise
      
      expect(result).toBe('success')
    })
  })
})

