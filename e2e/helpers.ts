import type { Page } from '@playwright/test'

/** Start with a clean browser: no saved progress. */
export async function freshStart(page: Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
}

/** Replace the editor's contents the way typing would (insertText avoids tag auto-closing). */
export async function setCode(page: Page, code: string) {
  await page.locator('.cm-content').click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(code)
}

/** On phones only one panel shows at a time; switch to the one we need. */
export async function showPanel(page: Page, name: 'Instructions' | 'Code' | 'Preview') {
  const toggle = page.getByRole('navigation', { name: 'Lesson panels' }).getByRole('button', { name, exact: true })
  if (await toggle.isVisible()) await toggle.click()
}

const page_ = (body: string) => `<html>\n<head>\n<title>Dinosaurs</title>\n</head>\n<body>\n${body}\n</body>\n</html>`

/** A correct answer for each of lesson 1's five editor steps. */
export const LESSON_1_ANSWERS = [
  '<html></html>',
  '<html>\n<head></head>\n</html>',
  '<html>\n<head>\n<title>Dinosaurs</title>\n</head>\n</html>',
  page_('Dinosaurs are awesome!'),
  page_('<h1>T-rex had tiny arms</h1>'),
]
