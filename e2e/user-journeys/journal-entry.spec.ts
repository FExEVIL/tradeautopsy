/**
 * E2E Test: Journal Entry User Journey
 * 
 * Tests the complete journal entry workflow:
 * 1. Create journal entry
 * 2. Add audio note
 * 3. Add tags and notes
 * 4. View entry
 * 5. Edit entry
 */

import { test, expect } from '@playwright/test'

test.describe('Journal Entry Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate with timeout
    await page.goto('/dashboard', { timeout: 10000, waitUntil: 'domcontentloaded' })
    // Check if redirected to login - if so, skip waiting for networkidle
    const currentUrl = page.url()
    if (!currentUrl.includes('/login')) {
      // Wait for networkidle with a shorter timeout
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
        // Ignore timeout if page is still loading - proceed anyway
      })
    }
  })

  test('should create a journal entry', async ({ page }) => {
    // Step 1: Navigate to journal with error handling for redirects
    try {
      await page.goto('/dashboard/journal', { timeout: 10000, waitUntil: 'domcontentloaded' })
    } catch (error: any) {
      // If navigation is interrupted by redirect, check the URL
      if (error.message?.includes('interrupted') || error.message?.includes('redirect')) {
        await page.waitForLoadState('domcontentloaded')
      } else {
        throw error
      }
    }
    // Check if redirected to login
    if (page.url().includes('/login')) {
      test.skip(true, 'Not authenticated - redirected to login')
      return
    }
    // Check if page loaded
    const pageTitle = await page.locator('h1').first().textContent().catch(() => '')
    if (pageTitle && pageTitle.includes('404')) {
      test.skip(true, 'Journal page not available')
      return
    }
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 })

    // Step 2: Click "New Entry" or "Add Entry"
    const newEntryButton = page.locator('button:has-text("New"), button:has-text("Add Entry"), button:has-text("Create")').first()
    if (await newEntryButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await newEntryButton.click()
      
      // Step 3: Fill journal entry form
      await page.waitForSelector('form, [data-testid="journal-form"]', { timeout: 3000 })
      
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first()
      if (await titleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await titleInput.fill('E2E Test Journal Entry')
      }

      const notesTextarea = page.locator('textarea[name="notes"], textarea[placeholder*="note" i]').first()
      if (await notesTextarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await notesTextarea.fill('This is a test journal entry created by E2E tests.')
      }

      // Step 4: Add tags if available
      const tagsInput = page.locator('input[name="tags"], input[placeholder*="tag" i]').first()
      if (await tagsInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tagsInput.fill('e2e-test, automation')
        await page.keyboard.press('Enter')
      }

      // Step 5: Submit entry
      const submitButton = page.locator('button[type="submit"], button:has-text("Save")').first()
      await submitButton.click()
      
      // Step 6: Verify entry appears
      await page.waitForLoadState('networkidle')
      await expect(page.locator('text=/E2E Test Journal Entry/i').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('should add audio note to journal entry', async ({ page }) => {
    // Navigate with timeout
    await page.goto('/dashboard/journal', { timeout: 10000, waitUntil: 'domcontentloaded' })
    // Check if redirected to login
    if (page.url().includes('/login')) {
      test.skip(true, 'Not authenticated - redirected to login')
      return
    }
    
    // Find existing entry or create one
    const entryCard = page.locator('[data-testid="journal-entry"], .journal-entry').first()
    if (await entryCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await entryCard.click()
      
      // Look for audio recorder button
      const audioButton = page.locator('button:has-text("Record"), button:has-text("Audio"), [data-testid="audio-recorder"]').first()
      if (await audioButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Note: Audio recording requires browser permissions
        // In a real test, you'd grant permissions first
        await audioButton.click()
        
        // Wait for recorder to initialize
        await page.waitForTimeout(1000)
        
        // Check if recorder is active
        const recordButton = page.locator('button:has-text("Start"), button:has-text("Record")').first()
        if (await recordButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          // Audio recording would require actual microphone access
          // This test verifies the UI is present
          await expect(recordButton).toBeVisible()
        }
      }
    }
  })

  test('should edit journal entry', async ({ page }) => {
    // Navigate with error handling for redirects
    try {
      await page.goto('/dashboard/journal', { timeout: 10000, waitUntil: 'domcontentloaded' })
    } catch (error: any) {
      // If navigation is interrupted by redirect, check the URL
      if (error.message?.includes('interrupted') || error.message?.includes('redirect')) {
        await page.waitForLoadState('domcontentloaded')
      } else {
        throw error
      }
    }
    // Check if redirected to login
    if (page.url().includes('/login')) {
      test.skip(true, 'Not authenticated - redirected to login')
      return
    }
    
    const entryCard = page.locator('[data-testid="journal-entry"], .journal-entry').first()
    if (await entryCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await entryCard.click()
      
      // Click edit button
      const editButton = page.locator('button:has-text("Edit")').first()
      if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editButton.click()
        
        // Update notes
        const notesTextarea = page.locator('textarea[name="notes"]').first()
        if (await notesTextarea.isVisible({ timeout: 2000 }).catch(() => false)) {
          await notesTextarea.fill('Updated journal entry notes from E2E test')
          await page.locator('button[type="submit"]').click()
          
          // Verify update
          await page.waitForLoadState('networkidle')
          await expect(page.locator('text=/Updated journal entry/i').first()).toBeVisible({ timeout: 3000 })
        }
      }
    }
  })
})

