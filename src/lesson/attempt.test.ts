import { describe, expect, it } from 'vitest'
import { attemptReducer, costsHeart, initialAttempt, xpForPass, type AttemptEvent, type AttemptState } from './attempt'

const run = (events: AttemptEvent[], from: AttemptState = initialAttempt) => events.reduce(attemptReducer, from)
const fail = (countsAsMistake = true): AttemptEvent => ({ type: 'CHECKED', result: 'fail', countsAsMistake })
const pass: AttemptEvent = { type: 'CHECKED', result: 'pass', countsAsMistake: true }

describe('attemptReducer', () => {
  it('counts each shown mistake', () => {
    expect(run([fail(), { type: 'EDITED' }, fail()])).toEqual({ phase: 'failed', failCount: 2 })
  })

  it('does not count warm-up mistakes', () => {
    expect(run([fail(false), fail(false)]).failCount).toBe(0)
  })

  it('returns to editing when the kid types after a mistake', () => {
    expect(run([fail(), { type: 'EDITED' }]).phase).toBe('editing')
  })

  it('locks the step once it passes, so stale checks and edits cannot undo it', () => {
    const passed = run([fail(), pass])
    expect(passed).toEqual({ phase: 'passed', failCount: 1 })
    expect(run([fail(), { type: 'EDITED' }], passed)).toBe(passed)
  })

  it('starts every step fresh', () => {
    expect(run([fail(), fail(), { type: 'STEP_STARTED' }])).toEqual(initialAttempt)
  })
})

describe('scoring rules', () => {
  it('gives full XP for a clean pass and half after a mistake', () => {
    expect(xpForPass(10, 0)).toBe(10)
    expect(xpForPass(10, 1)).toBe(5)
    expect(xpForPass(5, 2)).toBe(2)
  })

  it('costs a heart on every third mistake', () => {
    expect([1, 2, 3, 4, 5, 6].map(costsHeart)).toEqual([false, false, true, false, false, true])
  })
})
