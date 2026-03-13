import { expect, test } from '@playwright/test'

test('core onboarding flow generates compose and env outputs', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Docker Compose Generator' })).toBeVisible()

  await page.getByRole('button', { name: /BentoPDF/i }).first().click()

  await expect(page.getByRole('heading', { name: '2. Configure env values' })).toBeVisible()
  const maybeDbPasswordInput = page.locator('#env-field-db_password')
  if (await maybeDbPasswordInput.count()) {
    await maybeDbPasswordInput.fill('StrongPassword123')
  }

  await page.getByRole('button', { name: /^Generate$/ }).click()

  await expect(page.getByRole('heading', { name: '3. Generated output' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '.env' })).toBeVisible()
  await expect(page.getByText(/Security & setup helpers/i)).toBeVisible()
})
