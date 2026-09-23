import { describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'
import { localDateKey } from '../lesson/streak'

describe('gameStore persistence', () => {
  it('migrates v0 saves: toDateString visits become local date keys, dead fields are dropped', async () => {
    localStorage.setItem(
      'code4kidz-store',
      JSON.stringify({
        version: 0,
        state: {
          topicName: 'Space',
          completedLessons: ['lesson-01'],
          xp: 70,
          streak: 4,
          lastPlayedDate: 'Mon Sep 21 2026',
          streakJustBroke: true,
          classroomCode: '',
          voiceEnabled: true,
          failCount: 2,
        },
      }),
    )

    await useGameStore.persist.rehydrate()
    const s = useGameStore.getState() as unknown as Record<string, unknown>

    expect(s.topicName).toBe('Space')
    expect(s.xp).toBe(70)
    expect(s.lastPracticeDate).toBe('2026-09-21')
    expect(s.streakBrokenAfterDaysMissed).toBeNull()
    for (const gone of ['lastPlayedDate', 'streakJustBroke', 'classroomCode', 'voiceEnabled', 'failCount']) {
      expect(s).not.toHaveProperty(gone)
    }
  })

  it('keeps the review list across reloads', () => {
    useGameStore.getState().recordMistake('lesson-01', { stepId: 'step-1', failCount: 1, instruction: '', startingCode: '' })
    const saved = JSON.parse(localStorage.getItem('code4kidz-store')!)
    expect(saved.state.mistakeLog['lesson-01']).toHaveLength(1)
  })

  it('does not list a lesson twice when it is completed again', () => {
    useGameStore.setState({ completedLessons: [] })
    useGameStore.getState().markLessonComplete('lesson-01')
    useGameStore.getState().markLessonComplete('lesson-01')
    expect(useGameStore.getState().completedLessons).toEqual(['lesson-01'])
  })

  it('counts practice toward today, once', () => {
    useGameStore.setState({ streak: 0, lastPracticeDate: '', playedDates: [] })
    useGameStore.getState().recordPractice()
    useGameStore.getState().recordPractice()
    expect(useGameStore.getState()).toMatchObject({ streak: 1, lastPracticeDate: localDateKey(), playedDates: [localDateKey()] })
  })
})
