import type { LessonStep } from '../data/lessons/lesson-01'
import { type RefObject } from 'react'

export type ValidationResult = 'pass' | 'fail' | 'error'

export function validate(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  step: LessonStep,
  rawCode?: string
): ValidationResult {
  try {
    // Warm-up steps are not gated here — WarmUpStep / splash controls flow.
    if (step.type === 'warmup') return 'pass'

    // Get the iframe's window so CSS validators can call getComputedStyle
    const iframeWin = iframeRef.current?.contentWindow ?? undefined

    // Parse the kid's raw typed code using DOMParser (fast, no timing issues)
    // CSS validators must use iframeWin instead of doc for computed style checks
    if (rawCode !== undefined) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(rawCode, 'text/html')
      return step.validate(doc, rawCode, iframeWin) ? 'pass' : 'fail'
    }

    // Fallback: use iframe contentDocument if no rawCode provided
    const doc = iframeRef.current?.contentDocument
    if (!doc) return 'error'
    return step.validate(doc, undefined, iframeWin) ? 'pass' : 'fail'
  } catch {
    return 'fail' // NEVER crash on bad kid code
  }
}
