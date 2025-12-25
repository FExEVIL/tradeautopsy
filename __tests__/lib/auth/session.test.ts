/**
 * Session Management Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setSession, getSession, clearSession, SessionData } from '@/lib/auth/session'
import { cookies } from 'next/headers'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Mock iron-session
vi.mock('iron-session', () => ({
  sealData: vi.fn(async (data: SessionData) => JSON.stringify(data)),
  unsealData: vi.fn(async (sealed: string) => JSON.parse(sealed)),
}))

describe('Session Management', () => {
  const mockCookieStore = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(cookies as any).mockResolvedValue(mockCookieStore)
  })

  describe('setSession', () => {
    it('should set session cookie with correct options', async () => {
      const sessionData: SessionData = {
        userId: 'user123',
        email: 'test@example.com',
        workosUserId: 'workos123',
        firstName: 'Test',
        lastName: 'User',
      }

      await setSession(sessionData)

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'tradeautopsy_session',
        expect.any(String),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        }
      )
    })

    it('should handle errors gracefully', async () => {
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Cookie set failed')
      })

      const sessionData: SessionData = {
        userId: 'user123',
        email: 'test@example.com',
        workosUserId: 'workos123',
      }

      await expect(setSession(sessionData)).rejects.toThrow()
    })
  })

  describe('getSession', () => {
    it('should return session data when cookie exists', async () => {
      const sessionData: SessionData = {
        userId: 'user123',
        email: 'test@example.com',
        workosUserId: 'workos123',
      }

      mockCookieStore.get.mockReturnValue({
        value: JSON.stringify(sessionData),
      })

      const result = await getSession()

      expect(result).toEqual(sessionData)
    })

    it('should return null when no cookie exists', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      const result = await getSession()

      expect(result).toBeNull()
    })

    it('should return null on invalid cookie data', async () => {
      mockCookieStore.get.mockReturnValue({
        value: 'invalid-json',
      })

      const result = await getSession()

      expect(result).toBeNull()
    })
  })

  describe('clearSession', () => {
    it('should delete session cookie', async () => {
      await clearSession()

      expect(mockCookieStore.delete).toHaveBeenCalledWith('tradeautopsy_session')
    })

    it('should handle errors silently', async () => {
      mockCookieStore.delete.mockImplementation(() => {
        throw new Error('Delete failed')
      })

      // Should not throw
      await expect(clearSession()).resolves.toBeUndefined()
    })
  })
})

