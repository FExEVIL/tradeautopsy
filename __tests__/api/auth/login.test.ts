/**
 * Login API Route Tests
 * 
 * NOTE: These tests are currently skipped due to Request API requirements.
 * API route tests require Node.js 18+ or should be tested via E2E tests.
 * 
 * To enable these tests:
 * 1. Use Node.js 18+ (has built-in fetch/Request)
 * 2. Or use E2E tests with Playwright instead
 * 
 * For now, login functionality is tested via E2E tests in e2e/auth.spec.ts
 */

import { describe, it, vi, beforeEach } from 'vitest'

// Mock WorkOS
vi.mock('@/lib/workos', () => ({
  workos: {
    userManagement: {
      authenticateWithPassword: vi.fn(),
    },
  },
  WORKOS_CLIENT_ID: 'test-client-id',
}))

// Mock Supabase admin client
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  })),
}))

// Mock session
vi.mock('@/lib/auth/session', () => ({
  setSession: vi.fn(),
}))

// Skip all tests - API route testing requires Node 18+ or E2E approach
describe.skip('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 for missing email', async () => {
    // Test skipped - requires Node 18+ or E2E testing
  })

  it('should return 400 for missing password', async () => {
    // Test skipped - requires Node 18+ or E2E testing
  })

  it('should normalize email to lowercase', async () => {
    // Test skipped - requires Node 18+ or E2E testing
  })

  it('should return 401 for invalid credentials', async () => {
    // Test skipped - requires Node 18+ or E2E testing
  })

  it('should return 500 for server errors', async () => {
    // Test skipped - requires Node 18+ or E2E testing
  })
})
