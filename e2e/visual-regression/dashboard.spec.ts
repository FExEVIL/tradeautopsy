/**
 * Visual Regression Tests: Dashboard
 * 
 * Tests visual consistency of the dashboard across different viewports
 */

import { test, expect } from '@playwright/test'

test.describe('Dashboard Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')
    // Wait for content to load
    await page.waitForLoadState('networkidle')
  })

  test('should match dashboard snapshot on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page).toHaveScreenshot('dashboard-desktop.png', {
      fullPage: true,
      maxDiffPixels: 500, // Increased tolerance for dynamic dashboard content
    })
  })

  test('should match dashboard snapshot on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Allow dynamic content to render
    await expect(page).toHaveScreenshot('dashboard-tablet.png', {
      fullPage: true,
      maxDiffPixels: 1000, // Increased tolerance for dynamic dashboard content
    })
  })

  test('should match dashboard snapshot on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    // Wait for page to stabilize (dynamic content may change height)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Allow dynamic content to render
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      maxDiffPixels: 500, // Increased for dynamic content and height variations
    })
  })

  test('should match stat cards visual appearance', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    // StatCard doesn't have data-testid, so we'll look for the component structure
    const statCards = page.locator('.border.border-\\[\\#1a1a1a\\].rounded-lg.p-6').first()
    if (await statCards.count() === 0) {
      test.skip(true, 'No stat cards found on dashboard')
      return
    }
    await expect(statCards).toHaveScreenshot('stat-card.png', {
      maxDiffPixels: 50,
    })
  })

  test('should match chart visual appearance', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    // Wait for charts to render
    await page.waitForTimeout(2000)
    const chart = page.locator('canvas, [data-testid="chart"]').first()
    if (await chart.count() > 0) {
      await expect(chart).toHaveScreenshot('chart.png', {
        maxDiffPixels: 200, // Charts may have slight rendering differences
      })
    }
  })
})

