/**
 * Unit Tests: useMarketStatus Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMarketStatus } from '@/lib/hooks/useMarketStatus'

// Mock isMarketHoliday
vi.mock('@/lib/utils/market-holidays', () => ({
  isMarketHoliday: vi.fn().mockReturnValue(false),
}))

describe('useMarketStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return market status', () => {
    const { result } = renderHook(() => useMarketStatus())

    expect(result.current).toHaveProperty('isOpen')
    expect(result.current).toHaveProperty('statusText')
    expect(result.current).toHaveProperty('nextEvent')
  })

  it('should update status based on time', async () => {
    // Set time to market hours (10:00 AM IST)
    vi.setSystemTime(new Date('2024-01-15T10:00:00+05:30'))

    const { result } = renderHook(() => useMarketStatus())

    await waitFor(() => {
      expect(result.current.isOpen).toBeDefined()
    })

    expect(result.current.statusText).toBeDefined()
  })

  it('should show market closed on weekends', async () => {
    // Set time to Saturday
    vi.setSystemTime(new Date('2024-01-13T10:00:00+05:30'))

    const { result } = renderHook(() => useMarketStatus())

    await waitFor(() => {
      expect(result.current.isOpen).toBeDefined()
    })

    // Market should be closed on weekends
    expect(result.current.isOpen).toBe(false)
  })
})

