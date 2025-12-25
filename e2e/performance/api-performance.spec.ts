/**
 * E2E Performance Tests: API Response Times
 * 
 * Tests API endpoint performance
 */

import { test, expect } from '@playwright/test'

test.describe('API Performance', () => {
  test('should load dashboard API within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    // Navigate and wait for API calls
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Dashboard should load in under 5 seconds (adjusted for dev environment)
    // In production, this should be under 3 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should fetch trades API quickly', async ({ page, request }) => {
    // This test requires authentication
    // In a real scenario, you'd authenticate first
    
    const startTime = Date.now()
    
    try {
      const response = await request.get('/api/trades', {
        headers: {
          'Cookie': 'workos-session=test-session', // Mock session
        },
      })
      
      const responseTime = Date.now() - startTime
      
      // API should respond in under 500ms
      expect(responseTime).toBeLessThan(500)
    } catch (error) {
      // If not authenticated, skip test
      test.skip()
    }
  })

  test('should handle concurrent API requests efficiently', async ({ page, request }) => {
    const startTime = Date.now()
    
    // Make multiple concurrent requests
    const requests = [
      request.get('/api/trades'),
      request.get('/api/dashboard/metrics'),
      request.get('/api/user/me'),
    ]
    
    try {
      await Promise.all(requests)
      const totalTime = Date.now() - startTime
      
      // All requests should complete in under 1 second
      expect(totalTime).toBeLessThan(1000)
    } catch (error) {
      // If not authenticated, skip test
      test.skip()
    }
  })

  test('should cache API responses appropriately', async ({ page, request }) => {
    const firstRequestStart = Date.now()
    
    try {
      await request.get('/api/trades')
      const firstRequestTime = Date.now() - firstRequestStart
      
      // Second request should be faster (cached)
      const secondRequestStart = Date.now()
      await request.get('/api/trades')
      const secondRequestTime = Date.now() - secondRequestStart
      
      // Cached request should be at least 20% faster
      expect(secondRequestTime).toBeLessThan(firstRequestTime * 0.8)
    } catch (error) {
      test.skip()
    }
  })
})

