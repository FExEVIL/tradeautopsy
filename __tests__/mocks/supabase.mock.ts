/**
 * Supabase Mock
 * 
 * Mock implementation of Supabase client for testing
 */

import { vi } from 'vitest'

/**
 * Create a mock Supabase client
 */
export const createMockSupabaseClient = () => {
  const mockSelect = vi.fn().mockReturnThis()
  const mockInsert = vi.fn().mockReturnThis()
  const mockUpdate = vi.fn().mockReturnThis()
  const mockDelete = vi.fn().mockReturnThis()
  const mockEq = vi.fn().mockReturnThis()
  const mockSingle = vi.fn()
  const mockMaybeSingle = vi.fn()
  const mockOrder = vi.fn().mockReturnThis()
  const mockLimit = vi.fn().mockReturnThis()
  const mockRange = vi.fn().mockReturnThis()

  const mockFrom = vi.fn(() => ({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    eq: mockEq,
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    order: mockOrder,
    limit: mockLimit,
    range: mockRange,
  }))

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
    storage: {
      from: vi.fn(),
    },
    // Expose mocks for assertions
    _mocks: {
      from: mockFrom,
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
    },
  }
}

/**
 * Mock Supabase query response
 */
export const mockSupabaseResponse = <T,>(data: T, error: any = null) => {
  return {
    data,
    error,
    count: Array.isArray(data) ? data.length : null,
    status: error ? 400 : 200,
    statusText: error ? 'Bad Request' : 'OK',
  }
}

/**
 * Mock Supabase success response
 */
export const mockSuccess = <T,>(data: T) => mockSupabaseResponse(data, null)

/**
 * Mock Supabase error response
 */
export const mockError = (message: string, code?: string) => {
  return mockSupabaseResponse(null, {
    message,
    code,
    details: null,
    hint: null,
  })
}

