import { describe, expect, it } from 'vitest'
import { LESSONS, getLesson, isLessonUnlocked, passMessageFor, resolveText } from './index'

describe('lesson registry', () => {
  it('lists lessons 1-6 in order with unique ids', () => {
    expect(LESSONS.map((l) => l.lessonNumber)).toEqual([1, 2, 3, 4, 5, 6])
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length)
  })

  it('looks lessons up by the number in the URL', () => {
    expect(getLesson('3')?.id).toBe('lesson-03')
    expect(getLesson('7')).toBeUndefined()
    expect(getLesson('abc')).toBeUndefined()
    expect(getLesson(undefined)).toBeUndefined()
  })

  it('unlocks a lesson only after the previous one is complete', () => {
    const [one, two, three] = LESSONS
    expect(isLessonUnlocked(one, [])).toBe(true)
    expect(isLessonUnlocked(two, [])).toBe(false)
    expect(isLessonUnlocked(two, ['lesson-01'])).toBe(true)
    expect(isLessonUnlocked(three, ['lesson-01'])).toBe(false)
  })
})

describe('resolveText', () => {
  it('fills {topic} placeholders and calls function copy', () => {
    expect(resolveText('My {topic} page about {topic}', 'Dogs')).toBe('My Dogs page about Dogs')
    expect(resolveText((t) => `Hi ${t}`, 'Dogs')).toBe('Hi Dogs')
    expect(resolveText(undefined, 'Dogs')).toBe('')
  })
})

describe('lesson copy', () => {
  it('never hardcodes a topic: every string follows the kid\'s choice', () => {
    for (const lesson of LESSONS) {
      const copy = [lesson.byteIntro, lesson.celebrationQuote]
      for (const step of lesson.steps) {
        copy.push(step.instruction, step.bytePrompt, step.hint, step.startingCode, step.passMessage ?? '')
        copy.push(passMessageFor(lesson, step))
      }
      for (const field of copy) {
        expect(resolveText(field, 'Dinosaurs')).not.toMatch(/\bSpace\b/)
      }
    }
  })

  it('has a pass message for every step', () => {
    for (const lesson of LESSONS) {
      for (const step of lesson.steps) {
        expect(resolveText(passMessageFor(lesson, step), 'Dinosaurs').length).toBeGreaterThan(0)
      }
    }
  })
})
