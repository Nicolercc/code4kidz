import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EditorView } from '@codemirror/view'
import LessonPage from './LessonPage'
import { useGameStore } from '../store/gameStore'
import { VALIDATION_DEBOUNCE_MS } from '../hooks/useLessonMachine'

vi.mock('../utils/sounds', () => ({ play: vi.fn() }))

function renderLesson() {
  return render(
    <MemoryRouter initialEntries={['/lesson/1']}>
      <Routes>
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/map" element={<p>map</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

/** Type into CodeMirror the way a user edit arrives (not a programmatic value change). */
function typeCode(code: string) {
  const view = EditorView.findFromDOM(document.querySelector('.cm-editor') as HTMLElement)!
  act(() => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } }))
}

/** Lesson 1 opens on an intro; continue to step 1 like a keyboard user would. */
function continuePastIntro() {
  const cont = screen.getByRole('button', { name: /^continue$/i })
  expect(document.activeElement).toBe(cont) // focus lands on it, so Enter works immediately
  fireEvent.click(cont)
  act(() => vi.advanceTimersByTime(1000))
}

describe('LessonPage accessibility', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useGameStore.setState({ topicName: 'Space', completedLessons: [], currentStepIndex: 0, hearts: 3, xp: 0, isMuted: true })
  })
  afterEach(() => vi.useRealTimers())

  it('reads the intro as content with a real Continue button, not one giant button', () => {
    renderLesson()
    expect(screen.getByText(/I am Byte/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: /press space or tap/i })).toBeNull()
    expect(screen.getByRole('button', { name: /^continue$/i })).toBeTruthy()
  })

  it('has landmarks, a heading with the step, and labelled panels', () => {
    renderLesson()
    continuePastIntro()

    expect(screen.getByRole('banner')).toBeTruthy()
    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { level: 1 }).textContent).toBe('Lesson 1: Say Hello to the Web! — Step 1 of 5')
    for (const name of ['Instructions', 'Code editor', 'Live preview']) {
      expect(within(main).getByRole('region', { name })).toBeTruthy()
    }
    expect(screen.getByRole('textbox', { name: /your code/i })).toBeTruthy()
  })

  it('announces Byte\'s feedback through a status region, and hides the result bar until there is a result', () => {
    renderLesson()
    continuePastIntro()
    expect(screen.queryByText(/keep trying/i)).toBeNull()

    typeCode('<p>oops')
    act(() => vi.advanceTimersByTime(VALIDATION_DEBOUNCE_MS * 10))
    expect(screen.getByRole('status').textContent).not.toMatch(/not quite/i) // pausing is never a mistake

    fireEvent.click(screen.getByRole('button', { name: 'Check my code' }))
    expect(screen.getByRole('status').textContent).toMatch(/not quite/i)
  })

  it('tells screen reader users how many hearts are left', () => {
    renderLesson()
    continuePastIntro()
    expect(screen.getByText('3 of 3 hearts left')).toBeTruthy()
  })

  it('makes the hint a real disclosure whose text is readable', () => {
    renderLesson()
    continuePastIntro()
    // Available from the start, no failures needed.
    const toggle = screen.getByRole('button', { name: /hint/i })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')

    const panel = document.getElementById(toggle.getAttribute('aria-controls')!)!
    expect(panel.textContent).toMatch(/It starts with </)
    expect(within(panel).queryByRole('button')).toBeNull()
  })
})
