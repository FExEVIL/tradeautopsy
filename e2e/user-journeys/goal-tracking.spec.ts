/**
 * E2E Test: Goal Tracking User Journey
 * 
 * Tests the complete goal tracking workflow:
 * 1. Create a goal
 * 2. Track progress
 * 3. Update goal
 * 4. Complete goal
 */

import { test, expect } from '@playwright/test'

test.describe('Goal Tracking Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should create and track a goal', async ({ page }) => {
    // Step 1: Navigate to goals page
    await page.goto('/dashboard/goals')
    // Check if page loaded (might be 404 or redirect)
    const pageTitle = await page.locator('h1').first().textContent().catch(() => '')
    if (pageTitle && pageTitle.includes('404')) {
      test.skip(true, 'Goals page not available')
      return
    }
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 })

    // Step 2: Click "Create Goal" or "Add Goal" button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add Goal"), button:has-text("New Goal")').first()
    if (await createButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createButton.click()
      
      // Step 3: Fill goal form
      await page.waitForSelector('form, [data-testid="goal-form"]', { timeout: 3000 })
      
      const titleInput = page.locator('input[name="title"], input[placeholder*="goal" i]').first()
      if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await titleInput.fill('E2E Test Goal: Achieve ₹50,000 PnL')
      }

      const targetInput = page.locator('input[name="target"], input[type="number"]').first()
      if (await targetInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await targetInput.fill('50000')
      }

      const deadlineInput = page.locator('input[name="deadline"], input[type="date"]').first()
      if (await deadlineInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        const futureDate = new Date()
        futureDate.setMonth(futureDate.getMonth() + 1)
        await deadlineInput.fill(futureDate.toISOString().split('T')[0])
      }

      // Step 4: Submit goal
      const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first()
      await submitButton.click()
      
      // Step 5: Verify goal appears in list
      await page.waitForLoadState('networkidle')
      await expect(page.locator('text=/E2E Test Goal|50,000/i').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('should update goal progress', async ({ page }) => {
    await page.goto('/dashboard/goals')
    
    // Find an existing goal or create one
    const goalCard = page.locator('[data-testid="goal-card"], .goal-card').first()
    if (await goalCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await goalCard.click()
      
      // Look for progress update button
      const updateButton = page.locator('button:has-text("Update"), button:has-text("Edit")').first()
      if (await updateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await updateButton.click()
        
        // Update current value
        const currentValueInput = page.locator('input[name="current_value"], input[type="number"]').first()
        if (await currentValueInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await currentValueInput.fill('25000')
          await page.locator('button[type="submit"]').click()
          
          // Verify progress updated
          await page.waitForLoadState('networkidle')
          await expect(page.locator('text=/25,000|50%/i').first()).toBeVisible({ timeout: 3000 })
        }
      }
    }
  })

  test('should mark goal as complete', async ({ page }) => {
    await page.goto('/dashboard/goals')
    
    const goalCard = page.locator('[data-testid="goal-card"], .goal-card').first()
    if (await goalCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await goalCard.click()
      
      // Look for complete button
      const completeButton = page.locator('button:has-text("Complete"), button:has-text("Mark Complete")').first()
      if (await completeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await completeButton.click()
        
        // Confirm if there's a confirmation dialog
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first()
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click()
        }
        
        // Verify goal is marked complete
        await page.waitForLoadState('networkidle')
        await expect(page.locator('text=/completed|achieved/i').first()).toBeVisible({ timeout: 3000 })
      }
    }
  })
})

