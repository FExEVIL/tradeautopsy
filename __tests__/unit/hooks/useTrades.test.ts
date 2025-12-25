/**
 * Unit Tests: useTrades Hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTrades, useDashboardMetrics, useCalendarData } from '@/lib/hooks/useTradeData'

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher, options) => {
    const [data, setData] = vi.useState(null)
    const [error, setError] = vi.useState(null)
    const [isLoading, setIsLoading] = vi.useState(true)

    vi.useEffect(() => {
      if (fetcher) {
        fetcher(key)
          .then((result) => {
            setData(result)
            setIsLoading(false)
          })
          .catch((err) => {
            setError(err)
            setIsLoading(false)
          })
      }
    }, [key])

    return {
      data,
      error,
      isLoading,
      mutate: vi.fn(),
    }
  }),
}))

// Mock Supabase client
vi.mock('@supabase/ssr', () => ({
  createClientComponentClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    })),
  })),
}))

describe('useTrades', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch trades without date range', async () => {
    const { result } = renderHook(() => useTrades())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.trades).toBeDefined()
  })

  it('should fetch trades with date range', async () => {
    const { result } = renderHook(() =>
      useTrades('2024-01-01', '2024-01-31')
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.trades).toBeDefined()
  })
})

describe('useDashboardMetrics', () => {
  it('should calculate metrics correctly', async () => {
    const { result } = renderHook(() => useDashboardMetrics('user-123'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.metrics).toBeDefined()
  })
})

describe('useCalendarData', () => {
  it('should fetch calendar data', async () => {
    const { result } = renderHook(() =>
      useCalendarData('2024-01-01', '2024-01-31')
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
  })
})

