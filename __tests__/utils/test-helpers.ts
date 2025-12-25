/**
 * Test Utilities and Helpers
 */

import { SessionData } from '@/lib/auth/session'

/**
 * Create a mock session data object
 */
export function createMockSession(overrides?: Partial<SessionData>): SessionData {
  return {
    userId: 'test-user-id',
    email: 'test@example.com',
    workosUserId: 'test-workos-id',
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
  }
}

/**
 * Create a mock trade object
 */
export function createMockTrade(overrides?: any) {
  return {
    id: 'trade-1',
    user_id: 'test-user-id',
    profile_id: 'test-profile-id',
    symbol: 'NIFTY',
    tradingsymbol: 'NIFTY',
    transaction_type: 'BUY',
    quantity: 100,
    average_price: 15000,
    entry_price: 15000,
    exit_price: 15100,
    price: 15000,
    pnl: 1000,
    pnl_percentage: 0.67,
    trade_date: new Date().toISOString().split('T')[0],
    entry_date: new Date().toISOString().split('T')[0],
    exit_date: new Date().toISOString().split('T')[0],
    status: 'CLOSED',
    side: 'long',
    strategy: 'intraday',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Create a mock profile object
 */
export function createMockProfile(overrides?: any) {
  return {
    id: 'profile-1',
    user_id: 'test-user-id',
    workos_user_id: 'test-workos-id',
    name: 'Test Profile',
    email: 'test@example.com',
    type: 'equity',
    is_default: true,
    auth_provider: 'workos',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock Next.js request
 */
export function createMockRequest(
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): Request {
  return {
    method,
    headers: new Headers(headers),
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as any
}

/**
 * Mock Next.js response
 */
export function createMockResponse(): Response {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    headers: new Headers(),
  } as any
}

