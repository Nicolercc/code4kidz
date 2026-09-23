import { useCallback, useEffect, useReducer, useRef, useState, type RefObject } from 'react'
import type { EditorView } from '@codemirror/view'
import { useGameStore } from '../store/gameStore'
import { passMessageFor, resolveText, type Lesson, type LessonStep } from '../data/lessons'
import { attemptReducer, costsHeart, initialAttempt, xpForPass } from '../lesson/attempt'
import { validate } from '../utils/validator'
import { play } from '../utils/sounds'
import { useTimers } from './useTimers'

/**
 * Pause after the last keystroke before the code is checked automatically.
 * The automatic check can only PASS a step: pausing to think is never
 * counted as a mistake. Mistakes only come from pressing "Check my code".
 */
export const VALIDATION_DEBOUNCE_MS = 1_500
/** How long the pass celebration plays before the next step loads. */
export const PASS_ADVANCE_MS = 1_500
const TYPING_WINDOW_MS = 2_000
const STUCK_THRESHOLD_MS = 20_000
/** Lets the previous step's cheer stay visible before the next prompt replaces it. */
const STEP_MESSAGE_DELAY_MS = 400

export type PreviewFlash = 'idle' | 'pass' | 'fail'

// Shown before the real prompt when a step starts with code already in the editor.
function handoffText(step: LessonStep, topic: string): string | null {
  switch (step.type) {
    case 'fix':
    case 'identify':
      return `Uh oh — I wrote this code and made a mistake.\nFind it and fix it. The preview will tell you when it is right.`
    case 'combine':
      return `Look — your whole page is here.\nNOW make it yours. Change that h1 to something real about\n${topic}. I want to see YOUR words on the screen.`
    default:
      return null
  }
}

// Put the cursor where the learner should act: top for bug hunts, the h1 text
// for "make it yours", the end for writing new code.
function placeCursor(view: EditorView, step: LessonStep, code: string) {
  const docLen = view.state.doc.length
  const clamp = (n: number) => Math.max(0, Math.min(n, docLen))
  if (step.type === 'fix' || step.type === 'identify') {
    view.dispatch({ selection: { anchor: 0 }, scrollIntoView: true })
  } else if (step.type === 'combine') {
    const h1 = code.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1]
    const start = h1 ? code.indexOf(h1) : -1
    if (start === -1) return
    view.dispatch({ selection: { anchor: clamp(start), head: clamp(start + h1!.length) }, scrollIntoView: true })
  } else {
    view.dispatch({ selection: { anchor: docLen }, scrollIntoView: true })
  }
  view.focus()
}

interface Params {
  lesson: Lesson
  step: LessonStep
  stepIndex: number
  topic: string
  editorViewRef: RefObject<EditorView | null>
}

/**
 * Drives one lesson step: loads its starter code and prompt, checks the
 * learner's code after they pause, and plays the pass/fail sequence. All
 * timing goes through useTimers, so leaving the screen or moving to the next
 * step cancels anything still pending.
 */
export function useLessonMachine({ lesson, step, stepIndex, topic, editorViewRef }: Params) {
  const timers = useTimers()
  const [attempt, dispatch] = useReducer(attemptReducer, initialAttempt)
  const attemptRef = useRef(attempt)
  attemptRef.current = attempt

  const [isTyping, setIsTyping] = useState(false)
  const [isStuck, setIsStuck] = useState(false)
  const [justPassed, setJustPassed] = useState(false)
  const [justFailed, setJustFailed] = useState(false)
  const [previewFlash, setPreviewFlash] = useState<PreviewFlash>('idle')
  const [previewGlow, setPreviewGlow] = useState(false)
  const [showHighlight, setShowHighlight] = useState(false)

  const lastCodeRef = useRef('')
  // Read the editor ref through a ref so a new ref object never restarts the step.
  const editorRef = useRef(editorViewRef)
  editorRef.current = editorViewRef
  const resolve = useCallback((field: Parameters<typeof resolveText>[0]) => resolveText(field, topic), [topic])

  // Start of every step: reset, load starter code, then say the prompt.
  useEffect(() => {
    const { updateCode, setMascotMood } = useGameStore.getState()
    timers.cancelAll()
    dispatch({ type: 'STEP_STARTED' })
    setIsTyping(false)
    setIsStuck(false)
    setJustPassed(false)
    setJustFailed(false)
    setPreviewFlash('idle')
    setPreviewGlow(false)

    const starter = resolve(step.startingCode)
    lastCodeRef.current = starter
    updateCode(starter)

    if (step.type === 'warmup') {
      setMascotMood('idle', resolve(step.bytePrompt))
      return
    }

    const promptMood = stepIndex === 1 ? 'story' : 'idle'
    const handoff = starter ? handoffText(step, topic) : null
    timers.schedule(
      'prompt',
      () => {
        if (!handoff) return setMascotMood(promptMood, resolve(step.bytePrompt))
        setMascotMood(step.type === 'combine' ? 'think' : 'sad', handoff)
        timers.schedule('prompt', () => setMascotMood(promptMood, resolve(step.bytePrompt)), 2000)
      },
      STEP_MESSAGE_DELAY_MS,
    )

    if (starter) {
      // Briefly tint the editor so the learner notices code appeared.
      setShowHighlight(true)
      timers.schedule('highlight', () => setShowHighlight(false), 100)
      // Wait for the editor to receive the new value before moving the cursor.
      timers.schedule('cursor', () => {
        const view = editorRef.current.current
        if (view) placeCursor(view, step, starter)
      }, 150)
    }
  }, [lesson.id, step, stepIndex, topic, resolve, timers])

  const handlePass = useCallback(() => {
    const { gainXP, recordMistake, setMascotMood, advanceStep, recordPractice } = useGameStore.getState()
    const { failCount } = attemptRef.current
    dispatch({ type: 'CHECKED', result: 'pass', countsAsMistake: true })
    recordPractice() // a passed step is what counts toward the daily streak

    play('correct')
    setPreviewGlow(true)
    setPreviewFlash('pass')
    setJustPassed(true)
    setIsStuck(false)
    setIsTyping(false)
    timers.cancel('stuck')
    timers.schedule('glow', () => setPreviewGlow(false), 1500)
    timers.schedule('flash', () => setPreviewFlash('idle'), 1500)
    timers.schedule('justPassed', () => setJustPassed(false), 2000)

    // Byte jumps first, then speaks once he lands.
    setMascotMood('idle', '')
    timers.schedule('cheer', () => setMascotMood('cheer', resolve(passMessageFor(lesson, step))), 700)
    timers.schedule('xp', () => gainXP(xpForPass(step.xp, failCount)), 200)

    if (failCount > 0) {
      recordMistake(lesson.id, {
        stepId: step.id,
        failCount,
        instruction: resolve(step.instruction),
        startingCode: resolve(step.startingCode),
      })
    }

    timers.schedule('advance', advanceStep, PASS_ADVANCE_MS)
  }, [lesson, step, resolve, timers])

  // Only reached from an explicit "Check my code".
  const handleFail = useCallback(() => {
    const { loseHeart, setMascotMood, hearts } = useGameStore.getState()
    const isWarmup = step.type === 'warmup'
    const failCountAfter = attemptRef.current.failCount + (isWarmup ? 0 : 1)
    dispatch({ type: 'CHECKED', result: 'fail', countsAsMistake: !isWarmup })

    play('wrong')
    setPreviewFlash('fail')
    setJustFailed(true)
    timers.schedule('justFailed', () => setJustFailed(false), 1000)
    timers.schedule('flash', () => setPreviewFlash('idle'), 2200)

    if (isWarmup) setMascotMood('think', 'Not quite yet. Keep going! Warm-ups never cost hearts.')
    else if (costsHeart(failCountAfter) && hearts > 0) loseHeart()
    else setMascotMood('think', 'Not quite! Open the hint if you need help.')
  }, [step, timers])

  /** "Check my code": pass, or show and count the mistake. */
  const checkNow = useCallback(() => {
    if (attemptRef.current.phase === 'passed') return
    timers.cancel('check')
    if (validate(step, lastCodeRef.current, topic) === 'pass') handlePass()
    else handleFail()
  }, [step, topic, timers, handlePass, handleFail])

  const onCodeChange = useCallback(
    (code: string) => {
      if (attemptRef.current.phase === 'passed') return // locked during the celebration
      const { updateCode, setMascotMood } = useGameStore.getState()
      updateCode(code)
      lastCodeRef.current = code

      timers.cancel('check')
      if (attemptRef.current.phase === 'failed') setMascotMood('idle', '')
      dispatch({ type: 'EDITED' })

      setIsTyping(true)
      setIsStuck(false)
      timers.schedule('typing', () => setIsTyping(false), TYPING_WINDOW_MS)
      timers.schedule(
        'stuck',
        () => {
          setIsStuck(true)
          setMascotMood('think', 'Take your time. What does the instruction say to type?\nLook at the preview — does it match what you want?')
        },
        STUCK_THRESHOLD_MS,
      )

      // Automatic check on pause: celebrate a correct answer, stay quiet otherwise.
      timers.schedule(
        'check',
        () => {
          if (validate(step, lastCodeRef.current, topic) === 'pass') handlePass()
        },
        VALIDATION_DEBOUNCE_MS,
      )
    },
    [step, topic, timers, handlePass],
  )

  return {
    phase: attempt.phase,
    failCount: attempt.failCount,
    isTyping,
    isStuck,
    justPassed,
    justFailed,
    previewFlash,
    previewGlow,
    showHighlight,
    onCodeChange,
    checkNow,
  }
}
