import { expect, test } from '@playwright/test'
import { setCode } from './helpers'

test('corrects a visible draft and applies the fix to a new page', async ({ page }) => {
  await page.goto('/debugging-lab')
  const savedCourse = await page.evaluate(() => localStorage.getItem('code4kidz-store'))
  const check = page.getByRole('button', { name: 'Check my code' })
  const status = page.getByRole('status')

  await expect(page.getByRole('heading', { name: 'Make a home for Robots' })).toBeFocused()
  await check.click()
  await expect(status).toContainText('Your paragraph appears in the preview.')
  await page.getByRole('button', { name: 'Need a hint?' }).click()
  await expect(page.getByText('before the paragraph', { exact: false })).toBeVisible()

  await setCode(page, '<html><p>Robots</p></html>')
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Your code' })).toHaveText('<html><p>Robots</p></html>')
  await check.click()
  await expect(status).toContainText('You added both html tags')
  await page.getByRole('button', { name: 'Try a new page' }).click()
  await expect(page.getByRole('heading', { name: 'Fix the Space page' })).toBeFocused()
  await expect(page.getByRole('button', { name: 'Need a hint?' })).toHaveCount(0)

  await setCode(page, '<html><h1>Space</h1></html>')
  await check.click()
  await expect(status).toContainText('You fixed a new page')
  expect(await page.evaluate(() => localStorage.getItem('code4kidz-store'))).toBe(savedCourse)
})
