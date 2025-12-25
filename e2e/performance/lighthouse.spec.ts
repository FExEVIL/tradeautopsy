/**
 * E2E Performance Tests: Lighthouse Metrics
 * 
 * Tests Lighthouse performance scores
 * Note: Requires @playwright/test with lighthouse integration
 */

import { test, expect } from '@playwright/test'

test.describe('Lighthouse Performance', () => {
  test('should meet performance score target', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
      }
    })

    // Total load time should be under 5 seconds (adjusted for dev environment)
    // In production, this should be under 3 seconds
    expect(metrics.totalTime).toBeLessThan(5000)
  })

  test('should have acceptable bundle size', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Get resource sizes
    const resources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return resources
        .filter((r) => r.name.includes('/_next/static'))
        .map((r) => ({
          name: r.name,
          size: r.transferSize,
          duration: r.duration,
        }))
    })

    // Total bundle size should be reasonable
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0)
    // Should be under 3MB for initial load (realistic for Next.js apps with dependencies)
    expect(totalSize).toBeLessThan(3 * 1024 * 1024)
  })

  test('should load critical resources first', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Get resource load order
    const resources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return resources
        .filter((r) => r.initiatorType === 'script' || r.initiatorType === 'link')
        .map((r) => ({
          name: r.name,
          startTime: r.startTime,
          duration: r.duration,
        }))
        .sort((a, b) => a.startTime - b.startTime)
    })

    // Critical resources should load early
    const criticalResources = resources.filter((r) => 
      r.name.includes('main') || r.name.includes('app')
    )
    
    if (criticalResources.length > 0) {
      // First critical resource should start loading within 2 seconds (adjusted for dev environment)
      // In production, this should be under 500ms
      expect(criticalResources[0].startTime).toBeLessThan(2000)
    }
  })
})

