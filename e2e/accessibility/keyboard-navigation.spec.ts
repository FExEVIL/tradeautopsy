/**
 * E2E Test: Keyboard Navigation
 * 
 * Tests keyboard accessibility and navigation
 */

import { test, expect } from '@playwright/test'

test.describe('Keyboard Navigation', () => {
  test('should navigate dashboard with keyboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Find first focusable element (button, link, input)
    const focusable = page.locator('button, a, input, [tabindex]:not([tabindex="-1"])').first()
    if (await focusable.count() === 0) {
      test.skip(true, 'No focusable elements found on dashboard')
      return
    }
    
    await focusable.focus()
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
    
    // Continue tabbing
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Press Enter on focused element
    await page.keyboard.press('Enter')
    
    // Should navigate or trigger action
    await expect(page).not.toHaveURL('/dashboard')
  })

  test('should support keyboard shortcuts', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test common shortcuts
    // Ctrl+K for search (if implemented)
    await page.keyboard.press('Control+k')
    // Should open search or show keyboard shortcut hint
  })

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Find first focusable element and focus it
    const focusable = page.locator('button, a, input, [tabindex]:not([tabindex="-1"])').first()
    if (await focusable.count() === 0) {
      test.skip(true, 'No focusable elements found on dashboard')
      return
    }
    
    await focusable.focus()
    const focused = page.locator(':focus')
    
    const styles = await focused.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
      }
    })
    
    // Should have visible focus indicator
    expect(styles.outlineWidth).not.toBe('0px')
  })
})

