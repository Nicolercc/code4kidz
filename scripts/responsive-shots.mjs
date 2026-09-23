// Screenshots of the lesson screen at phone, tablet and desktop widths.
//   node scripts/responsive-shots.mjs docs/case-study/responsive before
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const [outDir, label] = process.argv.slice(2)
if (!outDir || !label) throw new Error('usage: node scripts/responsive-shots.mjs <dir> <label>')
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
for (const [name, width, height] of [['phone', 375, 812], ['tablet', 768, 1024], ['desktop', 1280, 800]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
  page.setDefaultTimeout(15000)
  await page.goto(BASE + '/')
  await page.evaluate(() => {
    localStorage.clear()
    localStorage.setItem('code4kidz-store', JSON.stringify({ state: { topicName: 'Space', streak: 1, lastPlayedDate: new Date().toDateString(), playedDates: [], completedLessons: ['lesson-01'], xp: 20, hearts: 3, isMuted: true }, version: 0 }))
  })
  await page.goto(BASE + '/lesson/2') // warm-up screen: instructions + editor + preview
  await page.waitForTimeout(1500)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await page.screenshot({ path: `${outDir}/${label}-${name}.png` })
  console.log(`${label} ${name} (${width}px): horizontal overflow ${overflow}px`)
  await page.close()
}
await browser.close()
