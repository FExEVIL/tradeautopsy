/**
 * Unit Tests: Logger Utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  logApiCall,
  logEvent,
  logDbQuery,
  logCacheOp,
  createLogger,
  createTimer,
  measureAsync,
} from '@/lib/utils/logger'

describe('Logger Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  describe('logApiCall', () => {
    it('should log successful API call', () => {
      logApiCall('GET', '/api/trades', 200, 150, 'user-123')
      expect(console.log).toHaveBeenCalledWith(
        'API GET /api/trades',
        expect.objectContaining({
          type: 'api_call',
          method: 'GET',
          path: '/api/trades',
          statusCode: 200,
          duration: 150,
          userId: 'user-123',
        })
      )
    })

    it('should log failed API call with error', () => {
      const error = new Error('Request failed')
      logApiCall('POST', '/api/trades', 500, 200, 'user-123', error)
      expect(console.error).toHaveBeenCalledWith(
        'API POST /api/trades failed',
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Request failed',
          }),
        })
      )
    })
  })

  describe('logEvent', () => {
    it('should log event with user ID and data', () => {
      logEvent('trade_created', 'user-123', { tradeId: 'trade-1' })
      expect(console.log).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'event',
          event: 'trade_created',
          userId: 'user-123',
          data: { tradeId: 'trade-1' },
        }),
        'Event: trade_created'
      )
    })
  })

  describe('logDbQuery', () => {
    it('should log successful database query', () => {
      logDbQuery('SELECT * FROM trades', 50, 10)
      expect(console.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'db_query',
          query: 'SELECT * FROM trades',
          duration: 50,
          rows: 10,
        }),
        'Database query executed'
      )
    })

    it('should log failed database query', () => {
      const error = new Error('Query failed')
      logDbQuery('SELECT * FROM trades', 50, undefined, error)
      expect(console.error).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Query failed',
          }),
        }),
        'Database query failed'
      )
    })
  })

  describe('logCacheOp', () => {
    it('should log cache hit', () => {
      logCacheOp('hit', 'cache-key', 5)
      expect(console.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cache_op',
          operation: 'hit',
          key: 'cache-key',
          duration: 5,
        }),
        'Cache hit'
      )
    })

    it('should log cache miss', () => {
      logCacheOp('miss', 'cache-key')
      expect(console.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cache_op',
          operation: 'miss',
          key: 'cache-key',
        }),
        'Cache miss'
      )
    })
  })

  describe('createLogger', () => {
    it('should create logger with context', () => {
      const logger = createLogger({ userId: 'user-123', requestId: 'req-1' })
      logger.info({ action: 'test' }, 'Test message')
      
      expect(console.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          requestId: 'req-1',
          action: 'test',
        }),
        'Test message'
      )
    })
  })

  describe('createTimer', () => {
    it('should measure duration', () => {
      vi.useFakeTimers()
      const timer = createTimer('test-timer')
      
      vi.advanceTimersByTime(100)
      const duration = timer.end()
      
      expect(duration).toBe(100)
      expect(console.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'timer',
          label: 'test-timer',
          duration: 100,
        }),
        'Timer: test-timer'
      )
      
      vi.useRealTimers()
    })
  })

  describe('measureAsync', () => {
    it('should measure async function execution', async () => {
      const fn = vi.fn().mockResolvedValue('result')
      const result = await measureAsync('async-test', fn)
      
      expect(result).toBe('result')
      expect(fn).toHaveBeenCalled()
      expect(console.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'timer',
          label: 'async-test',
        }),
        'async-test completed'
      )
    })

    it('should log failure on error', async () => {
      const error = new Error('Test error')
      const fn = vi.fn().mockRejectedValue(error)
      
      await expect(measureAsync('async-test', fn)).rejects.toThrow('Test error')
      expect(console.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'timer',
          label: 'async-test',
        }),
        'async-test failed'
      )
    })
  })
})

