import type { LessonStep } from '../data/lessons/lesson-01'
import { parseHtml } from './htmlChecks'

export type ValidationResult = 'pass' | 'fail'

/**
 * Check the kid's code for one step. Pure: it depends only on the code and
 * topic, never on the preview iframe, so it gives the same answer every time
 * and can be unit-tested (see data/lessons/lessons.test.ts).
 */
export function validate(step: LessonStep, rawCode: string, topic: string): ValidationResult {
  try {
    return step.validate(parseHtml(rawCode), rawCode, topic) ? 'pass' : 'fail'
  } catch {
    return 'fail' // never crash on half-typed kid code
  }
}
