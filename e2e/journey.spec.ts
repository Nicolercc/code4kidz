import { expect, test } from '@playwright/test'
import { LESSON_1_ANSWERS, freshStart, setCode, showPanel } from './helpers'

test('a new learner goes from the landing page through lesson 1, a review, and unlocks lesson 2', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await freshStart(page)

  // Onboarding, keyboard first: the Continue button is focused for us.
  await page.getByRole('button', { name: /Start Learning Free!/ }).click()
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await page.getByRole('textbox', { name: /what do you love/i }).fill('Dinosaurs')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'Dinosaurs!' })).toBeVisible()
  await page.getByRole('button', { name: /NEXT/ }).click()
  await page.getByRole('button', { name: 'START LESSON 1' }).click()

  // Map -> lesson 1.
  await page.getByRole('link', { name: 'Lesson 1: Say Hello to the Web! (start here)' }).click()
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  const heading = page.getByRole('heading', { level: 1, name: /Lesson 1: Say Hello to the Web!/ })
  await expect(heading).toHaveText(/Step 1 of 5/)

  // One checked mistake on step 1: announced, counted, and sent to review later.
  await showPanel(page, 'Code')
  await setCode(page, '<p>')
  await page.getByRole('button', { name: 'Check my code' }).click()
  await expect(page.getByRole('status').first()).toContainText(/not quite/i)

  // Pass all five steps.
  for (const [i, answer] of LESSON_1_ANSWERS.entries()) {
    await showPanel(page, 'Code')
    await setCode(page, answer)
    if (i < LESSON_1_ANSWERS.length - 1) await expect(heading).toHaveText(new RegExp(`Step ${i + 2} of 5`), { timeout: 8000 })
  }

  // The step with a mistake comes back for review.
  await expect(page).toHaveURL(/\/review\/1$/, { timeout: 8000 })
  await setCode(page, '<html></html>')
  await expect(page).toHaveURL(/\/complete\/1$/, { timeout: 8000 })

  // Back on the map, lesson 2 is open.
  await page.getByRole('button', { name: /CONTINUE/ }).click()
  await expect(page.getByRole('link', { name: 'Lesson 2: Make a Big Title! (start here)' })).toBeVisible()
  expect(errors).toEqual([])
})

test('pausing to think never costs a heart', async ({ page }) => {
  await freshStart(page)
  await page.evaluate(() =>
    localStorage.setItem('code4kidz-store', JSON.stringify({ version: 1, state: { topicName: 'Dinosaurs', completedLessons: [], playedDates: [], lastPracticeDate: '', streak: 0, xp: 0, hearts: 3, isMuted: true } })),
  )
  await page.goto('/lesson/1')
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await showPanel(page, 'Code')
  await setCode(page, '<ht')
  await page.waitForTimeout(6000)
  await expect(page.getByText('3 of 3 hearts left')).toBeAttached()
  await expect(page.getByRole('status').first()).not.toContainText(/not quite/i)
})
