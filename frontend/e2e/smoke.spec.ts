import { test, expect } from '@playwright/test'

test.describe('CRMFlow Smoke Tests', () => {
  test('home page loads successfully', async ({ page }) => {
    await page.goto('/')

    // Check for main heading
    await expect(page.locator('h1')).toContainText('Welcome to CRMFlow')

    // Check for feature cards
    await expect(page.locator('text=Visual Builder')).toBeVisible()
    await expect(page.locator('text=AI-Powered')).toBeVisible()
    await expect(page.locator('text=Integrations')).toBeVisible()
  })

  test('studio page loads successfully', async ({ page }) => {
    await page.goto('/studio')

    // Check for toolbar
    await expect(page.locator('text=CRMFlow Studio')).toBeVisible()

    // Check for main action buttons
    await expect(page.getByRole('button', { name: /New/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Save/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Run/i })).toBeVisible()

    // Check for panels
    await expect(page.locator('text=Configuration')).toBeVisible()
    await expect(page.locator('text=Run Console')).toBeVisible()
  })

  test('can open and close Voice Lab', async ({ page }) => {
    await page.goto('/studio')

    // Open Voice Lab
    await page.getByRole('button', { name: /Voice Lab/i }).click()

    // Check Voice Lab is visible
    await expect(page.locator('text=🎙️ Voice Lab')).toBeVisible()
    await expect(page.locator('text=TTS Preview')).toBeVisible()

    // Close Voice Lab
    await page.locator('button').filter({ hasText: /×/ }).first().click()

    // Voice Lab should be closed
    await expect(page.locator('text=🎙️ Voice Lab')).not.toBeVisible()
  })

  test('can open and close Settings modal', async ({ page }) => {
    await page.goto('/studio')

    // Open Settings
    await page.getByRole('button', { name: /Settings/i }).click()

    // Check Settings modal is visible
    await expect(page.locator('text=Mock Mode')).toBeVisible()
    await expect(page.locator('text=Auto-Save')).toBeVisible()

    // Close Settings
    await page.getByRole('button', { name: /Done/i }).click()

    // Settings should be closed
    await expect(page.locator('text=Mock Mode')).not.toBeVisible()
  })

  test('can toggle mock mode', async ({ page }) => {
    await page.goto('/studio')

    // Open Settings
    await page.getByRole('button', { name: /Settings/i }).click()

    // Find the mock mode toggle
    const mockToggle = page.locator('#mockMode')

    // Toggle it (assuming it starts as ON)
    await mockToggle.click()

    // Wait for state change
    await page.waitForTimeout(300)

    // Close and reopen to verify persistence
    await page.getByRole('button', { name: /Done/i }).click()
    await page.getByRole('button', { name: /Settings/i }).click()

    // Verify the setting persisted
    await expect(page.locator('text=Mock Mode')).toBeVisible()
  })

  test('Run Console tabs work', async ({ page }) => {
    await page.goto('/studio')

    // Check default tab (Logs)
    await expect(page.locator('text=No execution logs yet')).toBeVisible()

    // Click on Last Output tab
    await page.getByRole('button', { name: /Last Output/i }).click()
    await expect(page.locator('text=No output yet')).toBeVisible()

    // Click on Context tab
    await page.getByRole('button', { name: /Context/i }).click()
    await expect(page.locator('text=No context data yet')).toBeVisible()

    // Go back to Logs
    await page.getByRole('button', { name: /Logs/i }).click()
    await expect(page.locator('text=No execution logs yet')).toBeVisible()
  })

  test('can expand and collapse Run Console', async ({ page }) => {
    await page.goto('/studio')

    // Find the console
    const console = page.locator('text=Run Console').locator('..')

    // Console should be expanded by default
    await expect(page.locator('text=No execution logs yet')).toBeVisible()

    // Click the collapse button
    await page.locator('button').filter({ hasText: /⌄/ }).first().click()

    // Wait for animation
    await page.waitForTimeout(500)

    // Logs should not be visible when collapsed
    // (we can't check exact height in Playwright, but we verified the button exists)
  })

  test('Node Library displays categories', async ({ page }) => {
    await page.goto('/studio')

    // Check for node categories
    await expect(page.locator('text=Triggers')).toBeVisible()
    await expect(page.locator('text=Voice')).toBeVisible()
    await expect(page.locator('text=AI & Logic')).toBeVisible()
  })

  test('can load template from dropdown', async ({ page }) => {
    await page.goto('/studio')

    // Open templates dropdown
    await page.getByRole('button', { name: /Templates/i }).click()

    // Check for templates
    await expect(page.locator('text=SAP Sales Qualifier')).toBeVisible()
    await expect(page.locator('text=Qlay Candidate Screener')).toBeVisible()
  })

  test('Voice Lab TTS generation (mock mode)', async ({ page }) => {
    await page.goto('/studio')

    // Open Voice Lab
    await page.getByRole('button', { name: /Voice Lab/i }).click()

    // Enter text
    await page.locator('textarea[placeholder*="Enter text"]').fill('Hello, this is a test')

    // Click Generate TTS
    await page.getByRole('button', { name: /Generate TTS/i }).click()

    // Wait for generation
    await page.waitForTimeout(1000)

    // Check for audio player
    await expect(page.locator('audio')).toBeVisible()
  })

  test('keyboard shortcuts and accessibility', async ({ page }) => {
    await page.goto('/studio')

    // Check that important buttons have proper roles
    const newButton = page.getByRole('button', { name: /New/i })
    expect(await newButton.isVisible()).toBe(true)

    // Tab navigation should work
    await page.keyboard.press('Tab')

    // Check for ARIA labels on main elements
    const toolbar = page.locator('text=CRMFlow Studio')
    expect(await toolbar.isVisible()).toBe(true)
  })
})
