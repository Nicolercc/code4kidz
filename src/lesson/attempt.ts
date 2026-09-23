/**
 * One learner's attempt at one lesson step, as a pure state machine.
 *
 *   editing ──CHECKED(pass)──▶ passed   (terminal until the next step starts)
 *   editing ──CHECKED(fail)──▶ failed ──EDITED──▶ editing
 *
 * Timers, sounds and the store live in useLessonMachine; this file only
 * decides what state the attempt is in, so every transition is unit-tested.
 */

export type AttemptPhase = 'editing' | 'passed' | 'failed'

export interface AttemptState {
  phase: AttemptPhase
  /** Counted mistakes on this step. Drives half XP, hearts and the review screen. */
  failCount: number
}

export type AttemptEvent =
  | { type: 'STEP_STARTED' }
  | { type: 'EDITED' }
  | { type: 'CHECKED'; result: 'pass' | 'fail'; countsAsMistake: boolean }

export const initialAttempt: AttemptState = { phase: 'editing', failCount: 0 }

export function attemptReducer(state: AttemptState, event: AttemptEvent): AttemptState {
  switch (event.type) {
    case 'STEP_STARTED':
      return initialAttempt

    case 'EDITED':
      // Once passed the step is locked while the celebration plays.
      if (state.phase === 'passed') return state
      return state.phase === 'failed' ? { ...state, phase: 'editing' } : state

    case 'CHECKED':
      if (state.phase === 'passed') return state // a stale check must not undo a pass
      if (event.result === 'pass') return { ...state, phase: 'passed' }
      return {
        phase: 'failed',
        failCount: event.countsAsMistake ? state.failCount + 1 : state.failCount,
      }
  }
}

/** Full XP for a clean pass, half after any counted mistake. */
export function xpForPass(stepXp: number, failCount: number): number {
  return failCount === 0 ? stepXp : Math.floor(stepXp / 2)
}

/** Every third counted mistake on a step costs a heart. */
export function costsHeart(failCountAfterMistake: number): boolean {
  return failCountAfterMistake > 0 && failCountAfterMistake % 3 === 0
}
