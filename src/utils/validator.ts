import type { LessonStep, StepDiagnosis } from '../data/lessons/lesson-01'
import { parseHtml, withoutComments } from './htmlChecks'

export type ValidationResult = 'pass' | 'fail'

/**
 * Check the kid's code for one step. Pure: it depends only on the code and
 * topic, never on the preview iframe, so it gives the same answer every time
 * and can be unit-tested (see data/lessons/lessons.test.ts).
 */
export function validate(step: LessonStep, rawCode: string, topic: string): ValidationResult {
  return checkAnswer(step, rawCode, topic, false).result
}


const diagnosisMessages: Record<StepDiagnosis, string> = {
  'html-container-missing': 'Your paragraph appears in the preview. Add opening and closing html tags around it.',
  'html-closing-tag-missing': 'You wrote the opening html tag. Add the closing html tag with a slash.',
}

export const RETRY_MESSAGE = 'Not quite! Open the hint if you need help.'

/** Check and diagnose the same parsed draft when the learner asks for feedback. */
export function checkAnswer(step: LessonStep, rawCode: string, topic: string, includeDiagnosis = true):
  { result: 'pass' } | { result: 'fail'; message: string } {
  try {
    const code = withoutComments(rawCode)
    const doc = parseHtml(code)
    if (step.validate(doc, code, topic)) return { result: 'pass' }

    const diagnosis = includeDiagnosis ? step.diagnose?.(doc, code) : undefined
    if (diagnosis) return { result: 'fail', message: diagnosisMessages[diagnosis] }
  } catch {
    // Give partial drafts the same neutral feedback as unrecognized mistakes.
  }

  return { result: 'fail', message: RETRY_MESSAGE }
}
