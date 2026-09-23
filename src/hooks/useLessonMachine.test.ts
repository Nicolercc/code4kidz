import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { lesson01 } from '../data/lessons/lesson-01'
import { useGameStore } from '../store/gameStore'
import { FAIL_MESSAGE_DELAY_MS, PASS_ADVANCE_MS, VALIDATION_DEBOUNCE_MS, useLessonMachine } from './useLessonMachine'

vi.mock('../utils/sounds', () => ({ play: vi.fn() }))

const STEP_INDEX = 1 // lesson 1, step 1: "type <html></html>" (10 XP)
const step = lesson01.steps[STEP_INDEX]

function renderMachine() {
  return renderHook(() =>
    useLessonMachine({ lesson: lesson01, step, stepIndex: STEP_INDEX, topic: 'Space', editorViewRef: { current: null } }),
  )
}

/** Type, then wait long enough for the check and (if wrong) the mistake to be shown. */
function typeAndPause(result: ReturnType<typeof renderMachine>['result'], code: string) {
  act(() => result.current.onCodeChange(code))
  act(() => vi.advanceTimersByTime(VALIDATION_DEBOUNCE_MS + FAIL_MESSAGE_DELAY_MS))
}

describe('useLessonMachine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useGameStore.setState({ currentStepIndex: STEP_INDEX, xp: 0, hearts: 3, mistakeLog: {} })
  })
  afterEach(() => vi.useRealTimers())

  it('passes a correct answer, awards full XP, then advances', () => {
    const { result } = renderMachine()
    typeAndPause(result, '<html></html>')

    expect(result.current.phase).toBe('passed')
    expect(useGameStore.getState().xp).toBe(10)
    act(() => vi.advanceTimersByTime(PASS_ADVANCE_MS))
    expect(useGameStore.getState().currentStepIndex).toBe(STEP_INDEX + 1)
  })

  it('does not advance the lesson if the learner leaves mid-celebration', () => {
    const { result, unmount } = renderMachine()
    act(() => result.current.onCodeChange('<html></html>'))
    act(() => vi.advanceTimersByTime(VALIDATION_DEBOUNCE_MS))
    unmount()
    act(() => vi.advanceTimersByTime(10_000))
    expect(useGameStore.getState().currentStepIndex).toBe(STEP_INDEX)
  })

  it('does not flag code the learner is still typing', () => {
    const { result } = renderMachine()
    act(() => result.current.onCodeChange('<ht'))
    act(() => vi.advanceTimersByTime(VALIDATION_DEBOUNCE_MS + 500))
    act(() => result.current.onCodeChange('<htm')) // typed again before the mistake was shown
    act(() => vi.advanceTimersByTime(VALIDATION_DEBOUNCE_MS - 1))
    expect(result.current.failCount).toBe(0)
  })

  it('gives half XP and records the step for review after a mistake', () => {
    const { result } = renderMachine()
    typeAndPause(result, '<p>oops')
    expect(result.current.failCount).toBe(1)

    typeAndPause(result, '<html></html>')
    expect(useGameStore.getState().xp).toBe(5)
    expect(useGameStore.getState().mistakeLog['lesson-01']).toEqual([
      expect.objectContaining({ stepId: 'step-1', failCount: 1 }),
    ])
  })

  it('costs a heart on the third mistake', () => {
    const { result } = renderMachine()
    typeAndPause(result, '<p>1')
    typeAndPause(result, '<p>2')
    expect(useGameStore.getState().hearts).toBe(3)
    typeAndPause(result, '<p>3')
    expect(useGameStore.getState().hearts).toBe(2)
  })
})
