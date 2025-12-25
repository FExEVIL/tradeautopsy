/**
 * Unit Tests: useIntelligence Hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useIntelligence } from '@/hooks/useIntelligence'

// Mock fetch
global.fetch = vi.fn()

describe('useIntelligence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load dashboard on mount', async () => {
    const mockDashboard = { quickStats: {}, sections: [] }
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        dashboard: mockDashboard,
        chatHistory: [],
        emotionalState: null,
      }),
    } as Response)

    const { result } = renderHook(() => useIntelligence())

    await waitFor(() => {
      expect(result.current.initialized).toBe(true)
    })

    expect(result.current.dashboard).toEqual(mockDashboard)
    expect(result.current.loading).toBe(false)
  })

  it('should handle dashboard load error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to load' }),
    } as Response)

    const { result } = renderHook(() => useIntelligence())

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(result.current.initialized).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  it('should send chat message', async () => {
    const mockResponse = {
      message: {
        id: '1',
        role: 'assistant',
        content: 'Hello!',
        timestamp: new Date().toISOString(),
      },
    }

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          dashboard: {},
          chatHistory: [],
          emotionalState: null,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

    const { result } = renderHook(() => useIntelligence())

    await waitFor(() => {
      expect(result.current.initialized).toBe(true)
    })

    await result.current.chat('Hello')

    await waitFor(() => {
      expect(result.current.chatHistory.length).toBeGreaterThan(0)
    })

    expect(result.current.chatHistory[result.current.chatHistory.length - 1].content).toBe('Hello!')
  })

  it('should generate insights', async () => {
    const mockInsights = [{ id: '1', type: 'pattern', message: 'Test insight' }]

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          dashboard: {},
          chatHistory: [],
          emotionalState: null,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ insights: mockInsights }),
      } as Response)

    const { result } = renderHook(() => useIntelligence())

    await waitFor(() => {
      expect(result.current.initialized).toBe(true)
    })

    const insights = await result.current.generateInsights()

    expect(insights).toEqual(mockInsights)
  })

  it('should include profile_id in requests when provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        dashboard: {},
        chatHistory: [],
        emotionalState: null,
      }),
    } as Response)

    renderHook(() => useIntelligence({ profileId: 'test-profile' }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('profile_id=test-profile'),
        expect.any(Object)
      )
    })
  })
})

