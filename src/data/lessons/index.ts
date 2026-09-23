import type { Lesson, LessonStep, StrOrFn } from './lesson-01'
import { lesson01 } from './lesson-01'
import { lesson02 } from './lesson-02'
import { lesson03 } from './lesson-03'
import { lesson04 } from './lesson-04'
import { lesson05 } from './lesson-05'
import { lesson06 } from './lesson-06'

export type { Lesson, LessonStep, StrOrFn }

/** Every playable lesson, in unlock order. The single source for routes, the map and progress. */
export const LESSONS: readonly Lesson[] = [lesson01, lesson02, lesson03, lesson04, lesson05, lesson06]

/** Look a lesson up by the number in its URL (`/lesson/3`). */
export function getLesson(num: string | undefined): Lesson | undefined {
  return LESSONS.find((l) => String(l.lessonNumber) === num)
}

/** Lesson 1 is always open; every other lesson needs the one before it completed. */
export function isLessonUnlocked(lesson: Lesson, completedLessons: readonly string[]): boolean {
  const index = LESSONS.indexOf(lesson)
  return index <= 0 || completedLessons.includes(LESSONS[index - 1].id)
}

/** Lesson copy is either a string with `{topic}` placeholders or a function of the topic. */
export function resolveText(field: StrOrFn | undefined, topic: string): string {
  if (!field) return ''
  if (typeof field === 'function') return field(topic)
  return field.replace(/\{topic\}/g, topic)
}

const DEFAULT_PASS_MESSAGE = 'Perfect! You are building something real.'

/** What Byte says when a step passes. */
export function passMessageFor(_lesson: Lesson, step: LessonStep): StrOrFn {
  return step.passMessage ?? DEFAULT_PASS_MESSAGE
}
