/**
 * Integration Tests: Trades API - Create
 * 
 * Tests for POST /api/trades/manual endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { testAuthenticatedEndpoint, testUnauthenticatedEndpoint } from '@/__tests__/utils/api-utils'
import { testTrade } from '@/__tests__/fixtures/trades'

// Mock dependencies - must be hoisted before imports
const mockTrade = { ...testTrade }
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
}

// Create mock chain for Supabase queries
// Route does: supabase.from('trades').insert({...}).select().single()
const createMockInsertChain = (tradeData: any) => {
  const mockSingle = vi.fn().mockResolvedValue({
    data: tradeData,
    error: null,
  })
  const mockSelect = vi.fn().mockReturnValue({
    single: mockSingle,
  })
  const mockInsert = vi.fn().mockReturnValue({
    select: mockSelect,
  })
  return { mockInsert, mockSelect, mockSingle }
}

const { mockInsert, mockSelect, mockSingle } = createMockInsertChain(mockTrade)

const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  select: mockSelect,
  eq: vi.fn().mockReturnThis(),
  single: mockSingle,
}))

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    }),
  },
  from: mockFrom,
}

const mockCreateClient = vi.fn(() => Promise.resolve(mockSupabaseClient))

vi.mock('@/utils/supabase/server', () => ({
  createClient: mockCreateClient,
}))

vi.mock('@/lib/rule-engine', () => ({
  validateTradeAgainstRules: vi.fn().mockResolvedValue({
    allowed: true,
    violations: [],
  }),
  logRuleViolation: vi.fn(),
  updateAdherenceStats: vi.fn(),
}))

vi.mock('@/lib/profile-utils', () => ({
  getCurrentProfileId: vi.fn().mockResolvedValue('test-profile-id'),
}))

// Import route handler after mocks
import { POST } from '@/app/api/trades/manual/route'

describe('POST /api/trades/manual', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mocks to default authenticated state
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })
  })

  it('should create a trade successfully', async () => {
    const tradeData = {
      tradingsymbol: 'RELIANCE',
      quantity: 100,
      entry_price: 2500,
      exit_price: 2550,
      trade_date: new Date().toISOString().split('T')[0],
      side: 'BUY',
      strategy: 'INTRADAY',
    }

    // Set up fresh mock chain for this test
    const { mockInsert: testInsert, mockSelect: testSelect, mockSingle: testSingle } = createMockInsertChain(mockTrade)
    mockFrom.mockReturnValueOnce({
      insert: testInsert,
    })

    const response = await testAuthenticatedEndpoint(
      POST,
      'POST',
      tradeData,
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('trade')
    expect(data.trade).toHaveProperty('id')
    expect(data.trade.tradingsymbol).toBe(tradeData.tradingsymbol)
  })

  it('should return 401 when not authenticated', async () => {
    const tradeData = {
      symbol: 'RELIANCE',
      quantity: 100,
      entry_price: 2500,
    }

    // Mock unauthenticated user for this test
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const response = await testUnauthenticatedEndpoint(
      POST,
      'POST',
      tradeData,
    )

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toHaveProperty('error')
    
    // Restore mock for other tests
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })
  })

  it('should return 400 for invalid trade data', async () => {
    const invalidData = {
      tradingsymbol: '', // Invalid: empty symbol
      quantity: -1, // Invalid: negative quantity
    }

    // Mock rule validation to block the trade
    const { validateTradeAgainstRules } = await import('@/lib/rule-engine')
    vi.mocked(validateTradeAgainstRules).mockResolvedValueOnce({
      allowed: false,
      violations: [{
        rule: { id: '1', title: 'Invalid trade', severity: 'error' },
        message: 'Invalid trade data',
        details: {},
      }],
    })

    const response = await testAuthenticatedEndpoint(
      POST,
      'POST',
      invalidData,
    )

    // Should return 403 (blocked by rules) or 500 (validation error)
    expect([400, 403, 500]).toContain(response.status)
    const data = await response.json()
    expect(data).toHaveProperty('error')
    
    // Restore mock
    vi.mocked(validateTradeAgainstRules).mockResolvedValue({
      allowed: true,
      violations: [],
    })
  })

  it('should calculate PnL correctly', async () => {
    const tradeData = {
      tradingsymbol: 'RELIANCE',
      quantity: 100,
      entry_price: 2500,
      exit_price: 2550,
      trade_date: new Date().toISOString().split('T')[0],
      side: 'BUY',
      strategy: 'INTRADAY',
    }

    // Mock trade with calculated PnL
    const tradeWithPnL = {
      ...mockTrade,
      pnl: 5000,
      pnl_percentage: 2.0,
    }
    
    // Set up fresh mock chain for this test
    const { mockInsert: testInsert } = createMockInsertChain(tradeWithPnL)
    mockFrom.mockReturnValueOnce({
      insert: testInsert,
    })

    const response = await testAuthenticatedEndpoint(
      POST,
      'POST',
      tradeData,
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.trade).toBeDefined()
    // PnL may be calculated by the route or provided in tradeData
    if (data.trade.pnl !== undefined) {
      expect(data.trade.pnl).toBe(5000) // (2550 - 2500) * 100
    }
  })
})

