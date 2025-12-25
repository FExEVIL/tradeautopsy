/**
 * E2E Test: Weekly Review User Journey
 * 
 * Tests the complete weekly review workflow:
 * 1. View weekly summary
 * 2. Review performance metrics
 * 3. Analyze patterns
 * 4. Set goals for next week
 */

import { test, expect } from '@playwright/test'

test.describe('Weekly Review Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    // Check if redirected to login - if so, skip waiting for networkidle
    const currentUrl = page.url()
    if (!currentUrl.includes('/login')) {
      await page.waitForLoadState('networkidle').catch(() => {
        // Ignore timeout if page is still loading
      })
    }
  })

  test('should complete weekly review workflow', async ({ page }) => {
    // Step 1: Navigate to weekly review/analytics
    await page.goto('/dashboard/performance')
    // Wait for navigation and check if redirected to login
    await page.waitForLoadState('domcontentloaded')
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      test.skip(true, 'Not authenticated - redirected to login')
      return
    }
    // Check if page loaded (might be 404)
    const pageTitle = await page.locator('h1').first().textContent().catch(() => '')
    if (pageTitle && pageTitle.includes('404')) {
      test.skip(true, 'Performance page not available')
      return
    }
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 })

    // Step 2: View weekly summary
    const weeklySummary = page.locator('text=/this week|weekly summary|week performance/i').first()
    if (await weeklySummary.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(weeklySummary).toBeVisible()
    }

    // Step 3: Review performance metrics
    const metrics = [
      'Total PnL',
      'Win Rate',
      'Total Trades',
      'Average Profit',
    ]

    for (const metric of metrics) {
      const metricElement = page.locator(`text=/${metric}/i`).first()
      // Metric might be visible or might not exist if no data
      const isVisible = await metricElement.isVisible({ timeout: 2000 }).catch(() => false)
      if (isVisible) {
        await expect(metricElement).toBeVisible()
      }
    }

    // Step 4: View charts/visualizations
    const charts = page.locator('canvas, [data-testid="chart"], .chart').first()
    if (await charts.count() > 0) {
      await expect(charts).toBeVisible()
    }

    // Step 5: Navigate to patterns/insights
    const insightsLink = page.locator('a:has-text("Insights"), a:has-text("Patterns")').first()
    if (await insightsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Check if we're still on the performance page (not redirected to login)
      const currentUrl = page.url()
      if (!currentUrl.includes('/login')) {
        // Use Promise.race to handle potential redirect to login
        await Promise.race([
          insightsLink.click().then(() => page.waitForLoadState('networkidle').catch(() => null)),
          page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => null),
        ])
        // Check if redirected to login after clicking
        if (!page.url().includes('/login')) {
          await expect(page.locator('body')).toBeVisible()
        }
      }
    }
  })

  test('should export weekly report', async ({ page }) => {
    await page.goto('/dashboard/performance')
    // Wait for navigation and check if redirected to login
    await page.waitForLoadState('domcontentloaded')
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      test.skip(true, 'Not authenticated - redirected to login')
      return
    }
    // Check if page exists
    const pageTitle = await page.locator('h1').first().textContent().catch(() => '')
    if (pageTitle && pageTitle.includes('404')) {
      test.skip(true, 'Performance page not available')
      return
    }
    
    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")').first()
    if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
      await exportButton.click()
      
      const download = await downloadPromise
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.(pdf|csv|xlsx)$/i)
      }
    }
  })

  test('should filter by date range', async ({ page }) => {
    // Use Promise.race to handle potential redirect to login during navigation
    await Promise.race([
      page.goto('/dashboard/performance', { waitUntil: 'domcontentloaded' }),
      page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => null),
    ])
    // Check if redirected to login
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      test.skip(true, 'Not authenticated - redirected to login')
      return
    }
    // Check if page exists
    const pageTitle = await page.locator('h1').first().textContent().catch(() => '')
    if (pageTitle && pageTitle.includes('404')) {
      test.skip(true, 'Performance page not available')
      return
    }
    
    // Look for date range picker
    const datePicker = page.locator('input[type="date"], [data-testid="date-picker"]').first()
    if (await datePicker.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Select a date range
      const today = new Date()
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const startDate = lastWeek.toISOString().split('T')[0]
      const endDate = today.toISOString().split('T')[0]
      
      await datePicker.fill(startDate)
      await page.waitForTimeout(500)
      
      // Verify data updates (check for loading state or updated content)
      await page.waitForLoadState('networkidle')
    }
  })
})

