/**
 * Unit Tests: useOptimizedQuery Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useOptimizedQuery } from '@/hooks/use-optimized-query'

// Mock cache
vi.mock('@/lib/cache/redis', () => ({
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
  CacheKeys: {},
  CacheTTL: {},
}))

describe('useOptimizedQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return loading state initially', () => {
    const fetcher = vi.fn().mockResolvedValue('data')
    const { result } = renderHook(() =>
      useOptimizedQuery('test-key', fetcher)
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBe(null)
  })

  it('should fetch and return data', async () => {
    const fetcher = vi.fn().mockResolvedValue('test-data')
    const { result } = renderHook(() =>
      useOptimizedQuery('test-key', fetcher)
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBe('test-data')
    expect(result.current.isError).toBe(false)
  })

  it('should handle errors', async () => {
    const error = new Error('Fetch failed')
    const fetcher = vi.fn().mockRejectedValue(error)
    const { result } = renderHook(() =>
      useOptimizedQuery('test-key', fetcher)
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
    expect(result.current.data).toBe(null)
  })

  it('should deduplicate concurrent requests', async () => {
    const fetcher = vi.fn().mockResolvedValue('data')
    const { result: result1 } = renderHook(() =>
      useOptimizedQuery('same-key', fetcher)
    )
    const { result: result2 } = renderHook(() =>
      useOptimizedQuery('same-key', fetcher)
    )

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false)
      expect(result2.current.isLoading).toBe(false)
    })

    // Should only call fetcher once due to deduplication
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('should refetch when refetch is called', async () => {
    const fetcher = vi.fn().mockResolvedValue('data')
    const { result } = renderHook(() =>
      useOptimizedQuery('test-key', fetcher)
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await result.current.refetch()

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('should invalidate cache when invalidate is called', async () => {
    const { deleteCache } = await import('@/lib/cache/redis')
    const fetcher = vi.fn().mockResolvedValue('data')
    const { result } = renderHook(() =>
      useOptimizedQuery('test-key', fetcher)
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    result.current.invalidate()

    await waitFor(() => {
      expect(deleteCache).toHaveBeenCalled()
    })
  })
})

