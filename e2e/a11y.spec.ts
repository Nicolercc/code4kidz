import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { freshStart, setCode, showPanel } from './helpers'

const seed = { version: 1, state: { topicName: 'Dinosaurs', completedLessons: ['lesson-01'], playedDates: [], lastPracticeDate: '', streak: 0, xp: 60, hearts: 3, isMuted: true } }

/** WCAG 2.1 A/AA plus best practices. The preview iframe holds the learner's own code, not app UI. */
async function expectNoViolations(page: import('@playwright/test').Page) {
  // Let entrance fades finish: mid-fade text is translucent and would fail contrast.
  // Infinite animations (pulses, twinkles) never finish, so they are ignored.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity),
  )
  const results = await new AxeBuilder({ page })
    .options({ iframes: false })
    .exclude('iframe')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
}

test.beforeEach(async ({ page }) => {
  await freshStart(page)
})

for (const path of ['/', '/onboarding', '/nope']) {
  test(`${path} has no axe violations`, async ({ page }) => {
    await page.goto(path)
    await page.waitForTimeout(800)
    await expectNoViolations(page)
  })
}

test('map and lesson screens have no axe violations, including feedback and the hint', async ({ page }) => {
  await page.evaluate((s) => localStorage.setItem('code4kidz-store', JSON.stringify(s)), seed)
  await page.goto('/map')
  await page.waitForTimeout(800)
  await expectNoViolations(page)

  await page.goto('/lesson/2') // warm-up
  await expect(page.getByText('WARM-UP!')).toBeVisible()
  await expectNoViolations(page)

  await page.goto('/lesson/1')
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible()
  await expectNoViolations(page) // intro
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await showPanel(page, 'Code')
  await setCode(page, '<p>')
  await page.getByRole('button', { name: 'Check my code' }).click()
  await expectNoViolations(page) // wrong answer shown

  await showPanel(page, 'Instructions')
  const hintToggle = page.getByRole('button', { name: /hint/i })
  await hintToggle.click()
  // framer animates the panel's height/opacity in JS (not visible to getAnimations), so wait for it to land.
  const panelId = await hintToggle.getAttribute('aria-controls')
  await page.waitForFunction((id) => {
    const inner = document.getElementById(id!)?.firstElementChild
    return !!inner && getComputedStyle(inner).opacity === '1'
  }, panelId)
  await expectNoViolations(page) // hint open
})
