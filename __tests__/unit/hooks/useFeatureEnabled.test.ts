/**
 * Unit Tests: useFeatureEnabled Hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFeatureEnabled } from '@/lib/hooks/useFeatureEnabled'

// Mock ProfileDashboardContext
const mockCurrentDashboard = {
  enabledFeatures: ['feature1', 'feature2'],
}

vi.mock('@/lib/contexts/ProfileDashboardContext', () => ({
  useProfileDashboard: vi.fn(),
}))

vi.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: vi.fn((features, feature) => features.includes(feature)),
}))

describe('useFeatureEnabled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return true when feature is enabled', () => {
    const { useProfileDashboard } = require('@/lib/contexts/ProfileDashboardContext')
    vi.mocked(useProfileDashboard).mockReturnValue({
      currentDashboard: mockCurrentDashboard,
    } as any)

    const { result } = renderHook(() => useFeatureEnabled('feature1'))
    expect(result.current).toBe(true)
  })

  it('should return false when feature is not enabled', () => {
    const { useProfileDashboard } = require('@/lib/contexts/ProfileDashboardContext')
    vi.mocked(useProfileDashboard).mockReturnValue({
      currentDashboard: mockCurrentDashboard,
    } as any)

    const { result } = renderHook(() => useFeatureEnabled('feature3'))
    expect(result.current).toBe(false)
  })

  it('should return true when dashboard is not loaded (default)', () => {
    const { useProfileDashboard } = require('@/lib/contexts/ProfileDashboardContext')
    vi.mocked(useProfileDashboard).mockReturnValue({
      currentDashboard: null,
    } as any)

    const { result } = renderHook(() => useFeatureEnabled('feature1'))
    expect(result.current).toBe(true)
  })
})

