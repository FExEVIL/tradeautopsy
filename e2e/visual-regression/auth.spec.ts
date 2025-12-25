/**
 * Visual Regression Tests: Authentication Pages
 */

import { test, expect } from '@playwright/test'

test.describe('Auth Pages Visual Regression', () => {
  test('should match login page snapshot', async ({ page }) => {
    await page.goto('/login')
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500) // Allow fonts and animations to settle
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      maxDiffPixels: 2000, // Increased tolerance for font rendering differences across browsers
    })
  })

  test('should match login page on mobile', async ({ page }) => {
    await page.goto('/login')
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500) // Allow fonts and animations to settle
    await expect(page).toHaveScreenshot('login-page-mobile.png', {
      fullPage: true,
      maxDiffPixels: 2500, // Increased tolerance for font rendering differences across browsers
    })
  })

  test('should match signup page snapshot', async ({ page }) => {
    await page.goto('/signup/email')
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500) // Allow fonts and animations to settle
    await expect(page).toHaveScreenshot('signup-page.png', {
      fullPage: true,
      maxDiffPixels: 500, // Increased tolerance for font rendering differences
    })
  })

  test('should match OTP verification page snapshot', async ({ page }) => {
    await page.goto('/verify?email=test@example.com')
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500) // Allow fonts and animations to settle
    await expect(page).toHaveScreenshot('otp-verification.png', {
      fullPage: true,
      maxDiffPixels: 500, // Increased tolerance for font rendering differences
    })
  })

  test('should match form validation error states', async ({ page }) => {
    await page.goto('/login')
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    // Trigger validation error
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('invalid-email')
    await emailInput.blur()
    
    // Wait for validation message
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('login-validation-error.png', {
      fullPage: true,
      maxDiffPixels: 2000, // Validation errors may have dynamic content and timing differences
    })
  })
})

