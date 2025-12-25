/**
 * Integration Tests: POST /api/auth/send-code
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/auth/send-code/route'
import { NextRequest } from 'next/server'

// Mock WorkOS
const mockSendMagicAuthCode = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/workos', () => ({
  workos: {
    userManagement: {
      sendMagicAuthCode: mockSendMagicAuthCode,
    },
  },
  WORKOS_CLIENT_ID: 'test-client-id',
}))

describe('POST /api/auth/send-code', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send code for valid email', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockSendMagicAuthCode).toHaveBeenCalledWith({
      email: 'test@example.com',
    })
  })

  it('should return 400 for invalid email', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Valid email')
  })

  it('should return 400 for missing email', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Valid email')
  })

  it('should handle WorkOS errors', async () => {
    mockSendMagicAuthCode.mockRejectedValueOnce(new Error('WorkOS error'))

    const req = new NextRequest('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBeDefined()
  })
})

