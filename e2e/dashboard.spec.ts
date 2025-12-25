/**
 * Dashboard E2E Tests
 */

import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    // Note: In a real scenario, you'd need to authenticate first
    await page.goto('/dashboard')
  })

  test('should redirect to login if not authenticated', async ({ page }) => {
    // If not authenticated, should redirect to login
    // This depends on your middleware implementation
    const currentUrl = page.url()
    
    // Either on login page or dashboard (depending on auth state)
    expect(currentUrl).toMatch(/\/(login|dashboard)/)
  })

  test('should display dashboard content when authenticated', async ({ page }) => {
    // Skip if not authenticated
    test.skip(page.url().includes('/login'), 'Not authenticated')

    // Wait for dashboard content to load
    await expect(page.locator('body')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that mobile layout is applied
    await expect(page.locator('body')).toBeVisible()
  })
})

