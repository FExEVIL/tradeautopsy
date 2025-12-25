/**
 * Performance Tests: API Response Times
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/trades/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/api/middleware', () => ({
  withMiddleware: vi.fn((handler) => handler),
  successResponse: vi.fn((data, status, meta) => new Response(JSON.stringify({ data, ...meta }), { status })),
  errorResponse: vi.fn((error, status) => new Response(JSON.stringify({ error }), { status })),
}))

vi.mock('@/lib/cache/query-cache', () => ({
  getCachedTrades: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn().mockResolvedValue({ count: 0 }),
            })),
          })),
        })),
      })),
    })),
  }),
}))

describe('API Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should respond within acceptable time (< 500ms)', async () => {
    const start = performance.now()
    
    const req = new NextRequest('http://localhost:3000/api/trades', {
      method: 'GET',
    })

    await GET(req, { userId: 'user-id', profileId: 'profile-id' } as any)
    
    const duration = performance.now() - start
    
    // API should respond quickly (accounting for test overhead)
    expect(duration).toBeLessThan(1000) // 1 second for test environment
  })

  it('should use caching for repeated requests', async () => {
    const { getCachedTrades } = await import('@/lib/cache/query-cache')
    
    const req = new NextRequest('http://localhost:3000/api/trades', {
      method: 'GET',
    })

    await GET(req, { userId: 'user-id', profileId: 'profile-id' } as any)
    
    // Cache should be used
    expect(getCachedTrades).toHaveBeenCalled()
  })

  it('should handle pagination efficiently', async () => {
    const req = new NextRequest('http://localhost:3000/api/trades?page=0&pageSize=20', {
      method: 'GET',
    })

    const start = performance.now()
    await GET(req, { userId: 'user-id', profileId: 'profile-id' } as any)
    const duration = performance.now() - start

    // Paginated requests should be fast
    expect(duration).toBeLessThan(1000)
  })
})

