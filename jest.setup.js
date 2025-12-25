/**
 * Jest Setup File
 * Global test configuration
 */

// Polyfill Web APIs before any imports
if (typeof globalThis.Request === 'undefined') {
  try {
    // Try to use undici (Node.js 18+ has it)
    const { Request, Response, Headers } = require('undici')
    globalThis.Request = Request
    globalThis.Response = Response
    globalThis.Headers = Headers
  } catch (e) {
    // Fallback: Create minimal polyfill
    globalThis.Request = class Request {
      constructor(url, init) {
        this.url = url
        this.init = init
      }
      async json() { return this.init?.body || {} }
      async text() { return typeof this.init?.body === 'string' ? this.init.body : JSON.stringify(this.init?.body || {}) }
    }
    globalThis.Response = class Response {
      constructor(body, init) {
        this.body = body
        this.init = init
        this.status = 200
        this.headers = new Map()
      }
      async json() { return this.body || {} }
    }
    globalThis.Headers = class Headers {
      constructor(init) {
        this.init = init
      }
      get() { return null }
      set() {}
    }
  }
}

import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
  headers: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}))

// Mock Supabase client
jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))

// Mock Supabase server client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))

// Mock WorkOS
jest.mock('@/lib/workos', () => ({
  workos: {
    userManagement: {
      authenticateWithPassword: jest.fn(),
      createUser: jest.fn(),
    },
  },
  WORKOS_CLIENT_ID: 'test-client-id',
}))

// Suppress console errors in tests (but allow in development)
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }
}

// Setup test environment variables
process.env.NODE_ENV = 'test'
process.env.WORKOS_COOKIE_PASSWORD = 'test-cookie-password-minimum-32-characters-long'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Polyfill crypto.randomUUID for Node.js < 16.7.0 or test environments
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.randomUUID) {
  const { randomUUID } = require('crypto')
  if (randomUUID) {
    if (!globalThis.crypto) {
      globalThis.crypto = {}
    }
    globalThis.crypto.randomUUID = randomUUID
  } else {
    // Fallback for older Node.js versions
    if (!globalThis.crypto) {
      globalThis.crypto = {}
    }
    globalThis.crypto.randomUUID = function randomUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }
}

// Polyfill Web APIs for Jest environment
if (typeof globalThis.Request === 'undefined') {
  // Use Node.js 18+ built-in fetch/Request if available
  if (typeof fetch !== 'undefined' && fetch.Request) {
    globalThis.Request = fetch.Request
    globalThis.Response = fetch.Response
    globalThis.Headers = fetch.Headers
  } else {
    // Fallback: Create minimal polyfill (don't try to require undici - it may not exist)
    // This avoids module resolution delays
    globalThis.Request = class Request {
      constructor(url, init) {
        this.url = url
        this.init = init
      }
      async json() { return this.init?.body || {} }
      async text() { return typeof this.init?.body === 'string' ? this.init.body : JSON.stringify(this.init?.body || {}) }
    }
    globalThis.Response = class Response {
      constructor(body, init) {
        this.body = body
        this.init = init
        this.status = 200
        this.headers = new Map()
      }
      async json() { return this.body || {} }
    }
    globalThis.Headers = class Headers {
      constructor(init) {
        this.init = init
      }
      get() { return null }
      set() {}
    }
  }
}

