/**
 * WorkOS Mock
 * 
 * Mock implementation of WorkOS client for testing
 */

import { vi } from 'vitest'

/**
 * Create a mock WorkOS client
 */
export const createMockWorkOSClient = () => {
  return {
    userManagement: {
      authenticateWithEmailAndCode: vi.fn(),
      sendMagicLink: vi.fn(),
      getUser: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      listUsers: vi.fn(),
    },
    sso: {
      getAuthorizationUrl: vi.fn(),
      getProfile: vi.fn(),
    },
    mfa: {
      enrollFactor: vi.fn(),
      challengeFactor: vi.fn(),
      verifyFactor: vi.fn(),
    },
  }
}

/**
 * Mock WorkOS user
 */
export const mockWorkOSUser = {
  id: 'user_123456',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

/**
 * Mock WorkOS authentication response
 */
export const mockWorkOSAuthResponse = (success = true) => {
  return {
    success,
    user: success ? mockWorkOSUser : null,
    accessToken: success ? 'test-access-token' : null,
    refreshToken: success ? 'test-refresh-token' : null,
    error: success ? null : new Error('Authentication failed'),
  }
}

