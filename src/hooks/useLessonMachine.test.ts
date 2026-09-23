import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { lesson01 } from '../data/lessons/lesson-01'
import { lesson02 as lessonTwo } from '../data/lessons/lesson-02'
import { useGameStore } from '../store/gameStore'
import { PASS_ADVANCE_MS, VALIDATION_DEBOUNCE_MS, useLessonMachine } from './useLessonMachine'

vi.mock('../utils/sounds', () => ({ play: vi.fn() }))

const STEP_INDEX = 1 // lesson 1, step 1: "type <html></html>" (10 XP)
const editorViewRef = { current: null }

function renderMachine(lesson = lesson01, stepIndex = STEP_INDEX) {
  return renderHook(() =>
    useLessonMachine({ lesson, step: lesson.steps[stepIndex], stepIndex, topic: 'Space', editorViewRef }),
  )
}
type Machine = ReturnType<typeof renderMachine>['result']

/** Type, then pause long enough for the automatic check. */
function typeAndPause(result: Machine, code: string) {
  act(() => result.current.onCodeChange(code))
  act(() => vi.advanceTimersByTime(VALIDATION_DEBOUNCE_MS))
}

/** XP lands a moment after the pass so Byte's jump plays first. */
const XP_DELAY_MS = 200

/** Type, then press "Check my code". */
function typeAndCheck(result: Machine, code: string) {
  act(() => result.current.onCodeChange(code))
  act(() => result.current.checkNow())
}

describe('useLessonMachine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useGameStore.setState({ currentStepIndex: STEP_INDEX, xp: 0, hearts: 3, mistakeLog: {}, streak: 0, lastPracticeDate: '', playedDates: [] })
  })
  afterEach(() => vi.useRealTimers())

  it('passes a correct answer, awards full XP, then advances', () => {
    const { result } = renderMachine()
    typeAndPause(result, '<html></html>')

    expect(result.current.phase).toBe('passed')
    act(() => vi.advanceTimersByTime(XP_DELAY_MS))
    expect(useGameStore.getState().xp).toBe(10)
    expect(useGameStore.getState().streak).toBe(1) // passing a step is practice
    act(() => vi.advanceTimersByTime(PASS_ADVANCE_MS - XP_DELAY_MS))
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

  it('never counts a mistake just because the learner paused to think', () => {
    const { result } = renderMachine()
    typeAndPause(result, '<ht')
    act(() => vi.advanceTimersByTime(30_000))
    expect(result.current.failCount).toBe(0)
    expect(result.current.phase).toBe('editing')
    expect(useGameStore.getState().hearts).toBe(3)
  })

  it('passes on "Check my code" without waiting for the pause', () => {
    const { result } = renderMachine()
    typeAndCheck(result, '<html></html>')
    expect(result.current.phase).toBe('passed')
  })

  it('does not let the delayed step prompt overwrite feedback from an early check', () => {
    const { result } = renderMachine(lesson01, 4) // a fix step: handoff message, then the prompt 2.4s later
    typeAndCheck(result, '<html><body>broken<body></html>')
    expect(useGameStore.getState().byteMessage).toMatch(/not quite/i)
    act(() => vi.advanceTimersByTime(5000))
    expect(useGameStore.getState().byteMessage).toMatch(/not quite/i)
  })

  it('shows warm-up mistakes without counting them', () => {
    const { result } = renderMachine(lessonTwo, 0)
    typeAndCheck(result, 'x')
    expect(result.current.phase).toBe('failed')
    expect(result.current.failCount).toBe(0)
  })

  it('gives half XP and records the step for review after a mistake', () => {
    const { result } = renderMachine()
    typeAndCheck(result, '<p>oops')
    expect(result.current.failCount).toBe(1)

    typeAndPause(result, '<html></html>')
    act(() => vi.advanceTimersByTime(XP_DELAY_MS))
    expect(useGameStore.getState().xp).toBe(5)
    expect(useGameStore.getState().mistakeLog['lesson-01']).toEqual([
      expect.objectContaining({ stepId: 'step-1', failCount: 1 }),
    ])
  })

  it('costs a heart on the third mistake', () => {
    const { result } = renderMachine()
    typeAndCheck(result, '<p>1')
    typeAndCheck(result, '<p>2')
    expect(useGameStore.getState().hearts).toBe(3)
    typeAndCheck(result, '<p>3')
    expect(useGameStore.getState().hearts).toBe(2)
  })
})
