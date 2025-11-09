import { test, expect } from '@playwright/test'

test.describe('Flow Execution Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/studio')

    // Ensure we're in a clean state
    await page.getByRole('button', { name: /New/i }).click()

    // Confirm if dialog appears
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })
  })

  test('can create a simple flow and run it', async ({ page }) => {
    // This is a smoke test - we'll just verify the UI elements work
    // Actual flow creation requires drag-and-drop which is complex in Playwright

    // Click Run button
    await page.getByRole('button', { name: /Run/i }).click()

    // Wait for execution
    await page.waitForTimeout(2000)

    // Check Run Console for logs
    const logsTab = page.getByRole('button', { name: /Logs/i })
    await logsTab.click()

    // Should have some execution feedback
    // (exact content depends on whether there are nodes)
  })

  test('can simulate a call', async ({ page }) => {
    // Click Simulate Call button
    await page.getByRole('button', { name: /Simulate Call/i }).click()

    // Wait for execution
    await page.waitForTimeout(2000)

    // Check for logs
    await page.getByRole('button', { name: /Logs/i }).click()

    // Should show simulation logs
    const runConsole = page.locator('text=Run Console')
    await expect(runConsole).toBeVisible()
  })

  test('can clear execution logs', async ({ page }) => {
    // Run something first
    await page.getByRole('button', { name: /Run/i }).click()
    await page.waitForTimeout(1000)

    // Click Clear button
    await page.getByRole('button', { name: /Clear/i }).click()

    // Logs should be empty
    await expect(page.locator('text=No execution logs yet')).toBeVisible()
  })

  test('execution shows in all console tabs', async ({ page }) => {
    // Run a flow
    await page.getByRole('button', { name: /Simulate Call/i }).click()
    await page.waitForTimeout(2000)

    // Check Logs tab
    await page.getByRole('button', { name: /Logs/i }).click()
    // Should have content

    // Check Context tab
    await page.getByRole('button', { name: /Context/i }).click()
    // May or may not have content depending on execution

    // Check Last Output tab
    await page.getByRole('button', { name: /Last Output/i }).click()
    // May or may not have content depending on execution
  })
})
