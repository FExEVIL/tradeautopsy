/**
 * Unit Tests: Fetch Utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBaseUrl, apiRequest, clientFetch } from '@/lib/utils/fetch'

// Mock fetch
global.fetch = vi.fn()

describe('Fetch Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment
    delete (process.env as any).VERCEL_URL
    delete (process.env as any).NEXT_PUBLIC_SITE_URL
  })

  describe('getBaseUrl', () => {
    it('should return localhost in server environment', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      const url = getBaseUrl()
      expect(url).toBe('http://localhost:3000')
      
      global.window = originalWindow
    })

    it('should use VERCEL_URL if available', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      process.env.VERCEL_URL = 'example.vercel.app'
      
      const url = getBaseUrl()
      expect(url).toBe('https://example.vercel.app')
      
      global.window = originalWindow
    })

    it('should use NEXT_PUBLIC_SITE_URL if available', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
      
      const url = getBaseUrl()
      expect(url).toBe('https://example.com')
      
      global.window = originalWindow
    })

    it('should return window.location.origin in client environment', () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true,
      })
      
      const url = getBaseUrl()
      expect(url).toBe('https://example.com')
    })
  })

  describe('apiRequest', () => {
    it('should make request with relative URL', async () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      const result = await apiRequest('/api/test')
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual({ data: 'test' })
      
      global.window = originalWindow
    })

    it('should make request with absolute URL', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      await apiRequest('https://api.example.com/data')
      
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.any(Object)
      )
    })

    it('should throw error on failed request', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      } as Response)

      await expect(apiRequest('/api/test')).rejects.toThrow('Server error')
    })

    it('should merge custom headers', async () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response)

      await apiRequest('/api/test', {
        headers: {
          'Authorization': 'Bearer token',
          'X-Custom-Header': 'value',
        },
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token',
            'X-Custom-Header': 'value',
          }),
        })
      )
      
      global.window = originalWindow
    })
  })

  describe('clientFetch', () => {
    it('should work in client environment', async () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true,
      })

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      const result = await clientFetch('/api/test')
      
      expect(fetch).toHaveBeenCalledWith(
        'https://example.com/api/test',
        expect.any(Object)
      )
      expect(result).toEqual({ data: 'test' })
    })

    it('should throw error in server environment', async () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      await expect(clientFetch('/api/test')).rejects.toThrow(
        'clientFetch can only be used in client components'
      )

      global.window = originalWindow
    })
  })
})

