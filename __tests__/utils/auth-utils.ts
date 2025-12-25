/**
 * Authentication Test Utilities
 * 
 * Utilities for testing authentication flows and protected routes
 */

import { vi } from 'vitest'

/**
 * Mock authenticated user session
 */
export const mockAuthenticatedSession = () => {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      workosUserId: 'user_123456',
    },
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
  }
}

/**
 * Mock unauthenticated session
 */
export const mockUnauthenticatedSession = () => {
  return null
}

/**
 * Create a mock WorkOS user
 */
export const createMockWorkOSUser = (overrides = {}) => {
  return {
    id: 'user_123456',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

/**
 * Mock OTP verification
 */
export const mockOTPVerification = (success = true) => {
  return vi.fn().mockResolvedValue({
    success,
    user: success ? createMockWorkOSUser() : null,
    error: success ? null : new Error('Invalid OTP'),
  })
}

/**
 * Mock magic link authentication
 */
export const mockMagicLinkAuth = (success = true) => {
  return vi.fn().mockResolvedValue({
    success,
    user: success ? createMockWorkOSUser() : null,
    error: success ? null : new Error('Magic link expired'),
  })
}

/**
 * Create test session cookie
 */
export const createTestSessionCookie = (session = mockAuthenticatedSession()) => {
  return {
    name: 'workos-session',
    value: JSON.stringify(session),
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
  }
}

