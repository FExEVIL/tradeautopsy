/**
 * Integration Tests: POST /api/auth/verify-code
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/verify-code/route'
import { NextRequest } from 'next/server'

// Mock WorkOS
const mockAuthenticateWithMagicAuth = vi.fn()
vi.mock('@/lib/workos', () => ({
  workos: {
    userManagement: {
      authenticateWithMagicAuth: mockAuthenticateWithMagicAuth,
    },
  },
  WORKOS_CLIENT_ID: 'test-client-id',
}))

// Mock Supabase
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockMaybeSingle = vi.fn()
const mockUpdate = vi.fn()
const mockInsert = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        listUsers: vi.fn().mockResolvedValue({ users: [] }),
        createUser: vi.fn().mockResolvedValue({
          user: { id: 'new-user-id', email: 'test@example.com' },
        }),
      },
    },
  })),
}))

describe('POST /api/auth/verify-code', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'

    // Setup Supabase mock chain
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
      insert: mockInsert,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      maybeSingle: mockMaybeSingle,
    })
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })
    mockInsert.mockReturnValue({
      select: mockSelect,
    })
    mockSelect.mockReturnValue({
      single: mockSingle,
    })
  })

  it('should verify code and create session', async () => {
    const mockUser = {
      id: 'workos-user-id',
      email: 'test@example.com',
      emailVerified: true,
    }

    mockAuthenticateWithMagicAuth.mockResolvedValueOnce({ user: mockUser })
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    mockSingle.mockResolvedValueOnce({
      data: { id: 'profile-id', user_id: 'user-id' },
      error: null,
    })

    const req = new NextRequest('http://localhost:3000/api/auth/verify-code', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'test-agent',
      },
      body: JSON.stringify({ email: 'test@example.com', code: '123456' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockAuthenticateWithMagicAuth).toHaveBeenCalledWith({
      email: 'test@example.com',
      code: '123456',
      clientId: 'test-client-id',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    })
  })

  it('should return 400 for missing email or code', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Email and verification code')
  })

  it('should return 401 for invalid code', async () => {
    mockAuthenticateWithMagicAuth.mockResolvedValueOnce({ user: null })

    const req = new NextRequest('http://localhost:3000/api/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', code: '000000' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toContain('Invalid verification code')
  })
})

