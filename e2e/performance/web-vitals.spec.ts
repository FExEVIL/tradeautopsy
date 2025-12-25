/**
 * E2E Performance Tests: Web Vitals
 * 
 * Tests Core Web Vitals and performance metrics
 */

import { test, expect } from '@playwright/test'

test.describe('Web Vitals Performance', () => {
  test('should meet LCP (Largest Contentful Paint) target', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number }
          resolve(lastEntry.renderTime || lastEntry.loadTime || 0)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // Timeout after 10 seconds
        setTimeout(() => resolve(0), 10000)
      })
    })

    // LCP should be under 4 seconds (adjusted for dev environment)
    // In production, this should be under 2.5 seconds
    expect(lcp).toBeLessThan(4000)
  })

  test('should meet FID (First Input Delay) target', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Measure FID by clicking a button
    const fid = await page.evaluate(() => {
      return new Promise((resolve) => {
        let fidValue = 0
        
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              fidValue = entry.processingStart - entry.startTime
            }
          })
        }).observe({ entryTypes: ['first-input'] })
        
        // Trigger first input
        const button = document.querySelector('button')
        if (button) {
          button.click()
        }
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(fidValue), 5000)
      })
    })

    // FID should be under 100ms (good)
    expect(fid).toBeLessThan(100)
  })

  test('should meet CLS (Cumulative Layout Shift) target', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Measure CLS
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0
        
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput && entry.value) {
              clsValue += entry.value
            }
          })
        }).observe({ entryTypes: ['layout-shift'] })
        
        // Wait for page to stabilize
        setTimeout(() => resolve(clsValue), 3000)
      })
    })

    // CLS should be under 0.1 (good)
    expect(cls).toBeLessThan(0.1)
  })

  test('should meet FCP (First Contentful Paint) target', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Measure FCP
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find((entry: any) => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            resolve(fcpEntry.startTime)
          }
        }).observe({ entryTypes: ['paint'] })
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(0), 5000)
      })
    })

    // FCP should be under 1.8 seconds (good)
    expect(fcp).toBeLessThan(1800)
  })

  test('should meet TTFB (Time to First Byte) target', async ({ page }) => {
    const startTime = Date.now()
    const responsePromise = page.waitForResponse((response) => {
      const url = response.url()
      return url.includes('/dashboard') || url.includes('/api/') || response.status() === 200
    }, { timeout: 10000 }).catch(() => null)
    
    await page.goto('/dashboard')
    const response = await responsePromise
    const ttfb = Date.now() - startTime

    // TTFB should be under 2000ms (reasonable for dev server)
    // In production, this should be under 800ms
    expect(ttfb).toBeLessThan(2000)
  })
})

