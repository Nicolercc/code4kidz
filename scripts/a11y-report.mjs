// Accessibility snapshot of the key screens, for before/after comparison.
//
//   pnpm build && pnpm preview --port 4173 &
//   node scripts/a11y-report.mjs docs/case-study/a11y-before
//
// For each screen it writes: axe violations (JSON + summary), the ARIA tree
// Playwright exposes (what assistive tech gets), and a screenshot. The ARIA
// tree is a machine proxy, not a substitute for testing with VoiceOver.
import { chromium } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const outDir = process.argv[2]
if (!outDir) throw new Error('usage: node scripts/a11y-report.mjs <output-dir>')

const progress = (completedLessons) => ({
  state: {
    topicName: 'Space',
    streak: 1,
    lastPlayedDate: new Date().toDateString(),
    playedDates: [],
    completedLessons,
    xp: 0,
    hearts: 3,
    isMuted: true,
  },
  version: 0,
})

/**
 * Lesson 1 opens on an intro. The remediated intro focuses a real Continue
 * button (Enter works immediately); the original had none and needed Tab first.
 */
async function continuePastIntro(page) {
  const cont = page.getByRole('button', { name: 'Continue', exact: true })
  if (await cont.count()) await page.keyboard.press('Enter')
  else {
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
  }
  await page.waitForTimeout(800)
}

/** Each screen: where to go, what progress to seed, and how to reach the state worth auditing. */
const SCREENS = [
  { name: 'landing', url: '/', seed: null },
  { name: 'onboarding', url: '/onboarding', seed: null },
  { name: 'map', url: '/map', seed: progress(['lesson-01']) },
  { name: 'lesson-1-intro', url: '/lesson/1', seed: progress([]) },
  {
    name: 'lesson-1-step-1',
    url: '/lesson/1',
    seed: progress([]),
    // Lesson 1 opens on an intro splash; continue past it to the editor.
    prepare: async (page) => {
      await continuePastIntro(page)
      await page.locator('.cm-content').waitFor()
      await page.waitForTimeout(800) // let the intro's exit animation finish
    },
  },
  {
    name: 'lesson-1-wrong-answer',
    url: '/lesson/1',
    seed: progress([]),
    prepare: async (page) => {
      await continuePastIntro(page)
      await page.locator('.cm-content').click()
      await page.keyboard.type('<p>oops')
      await page.waitForTimeout(3500) // validation debounce + fail-message delay
    },
  },
  {
    name: 'lesson-1-hint-open',
    url: '/lesson/1',
    seed: progress([]),
    prepare: async (page) => {
      await continuePastIntro(page)
      const editor = page.locator('.cm-content')
      // The hint unlocks after two counted mistakes.
      for (const attempt of ['<p>a', '<p>b']) {
        await editor.click()
        await page.keyboard.type(attempt)
        await page.waitForTimeout(3500)
      }
      await page.getByRole('button', { name: /hint/i }).click()
      await page.waitForTimeout(600)
    },
  },
]

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()
const summary = []

for (const screen of SCREENS) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  await page.goto(BASE + '/')
  await page.evaluate((seed) => {
    localStorage.clear()
    if (seed) localStorage.setItem('code4kidz-store', JSON.stringify(seed))
  }, screen.seed)
  await page.goto(BASE + screen.url)
  await page.waitForTimeout(1200)
  if (screen.prepare) await screen.prepare(page)

  // The preview iframe holds the kid's code (not app UI) and is sandboxed with
  // scripts off, so axe cannot inject into it and would wait forever.
  const axe = await new AxeBuilder({ page }).options({ iframes: false }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze()
  const violations = axe.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.length,
    examples: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
  }))
  const aria = await page.locator('body').ariaSnapshot()

  const base = path.join(outDir, screen.name)
  await writeFile(`${base}.axe.json`, JSON.stringify(violations, null, 2))
  await writeFile(`${base}.aria.yml`, aria)
  await page.screenshot({ path: `${base}.png` })

  const nodes = violations.reduce((n, v) => n + v.nodes, 0)
  summary.push({ screen: screen.name, rules: violations.length, nodes, ids: violations.map((v) => `${v.id}(${v.nodes})`).join(', ') })
  await context.close()
}

await browser.close()

const lines = ['| Screen | axe rules violated | elements affected | rules |', '|---|---|---|---|']
for (const s of summary) lines.push(`| ${s.screen} | ${s.rules} | ${s.nodes} | ${s.ids || 'none'} |`)
await writeFile(path.join(outDir, 'SUMMARY.md'), lines.join('\n') + '\n')
console.log(lines.join('\n'))
