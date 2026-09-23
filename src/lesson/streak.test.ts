import { describe, expect, it } from 'vitest'
import { checkStreak, daysBetween, lastSevenDays, localDateKey, recordPractice, type StreakFields } from './streak'

const fresh: StreakFields = { streak: 0, lastPracticeDate: '', playedDates: [] }

describe('localDateKey', () => {
  it('uses the local calendar day, not UTC', () => {
    // 11:30pm local is still that day locally, whatever UTC says.
    expect(localDateKey(new Date(2026, 8, 22, 23, 30))).toBe('2026-09-22')
    expect(localDateKey(new Date(2026, 0, 5, 0, 5))).toBe('2026-01-05')
  })
})

describe('daysBetween', () => {
  it('counts calendar days, including across months and DST changes', () => {
    expect(daysBetween('2026-09-22', '2026-09-23')).toBe(1)
    expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1)
    expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2) // US DST starts Mar 8
  })
})

describe('recordPractice', () => {
  it('starts a streak on the first practice', () => {
    expect(recordPractice(fresh, '2026-09-23')).toEqual({ streak: 1, lastPracticeDate: '2026-09-23', playedDates: ['2026-09-23'] })
  })

  it('counts each day once', () => {
    const once = recordPractice(fresh, '2026-09-23')
    expect(recordPractice(once, '2026-09-23')).toBe(once)
  })

  it('grows on consecutive days and restarts after a gap', () => {
    const day1 = recordPractice(fresh, '2026-09-21')
    const day2 = recordPractice(day1, '2026-09-22')
    expect(day2.streak).toBe(2)
    expect(recordPractice(day2, '2026-09-25').streak).toBe(1)
  })

  it('keeps 30 days of history', () => {
    let s = fresh
    for (let d = 1; d <= 31; d++) s = recordPractice(s, `2026-08-${String(d).padStart(2, '0')}`)
    expect(s.playedDates).toHaveLength(30)
    expect(s.playedDates[0]).toBe('2026-08-02')
  })
})

describe('checkStreak', () => {
  const onDay = (lastPracticeDate: string, streak: number): StreakFields => ({ streak, lastPracticeDate, playedDates: [] })

  it('keeps the streak if the learner practised today or yesterday', () => {
    expect(checkStreak(onDay('2026-09-23', 3), '2026-09-23')).toEqual({ streak: 3, brokenAfterDaysMissed: null })
    expect(checkStreak(onDay('2026-09-22', 3), '2026-09-23')).toEqual({ streak: 3, brokenAfterDaysMissed: null })
  })

  it('reports how many days were missed when a streak of 2+ breaks', () => {
    // Practised Monday the 20th, back Thursday the 23rd: missed Tuesday and Wednesday.
    expect(checkStreak(onDay('2026-09-20', 5), '2026-09-23')).toEqual({ streak: 0, brokenAfterDaysMissed: 2 })
  })

  it('resets a 1-day streak quietly', () => {
    expect(checkStreak(onDay('2026-09-20', 1), '2026-09-23')).toEqual({ streak: 0, brokenAfterDaysMissed: null })
  })

  it('does nothing for a brand new learner', () => {
    expect(checkStreak(fresh, '2026-09-23')).toEqual({ streak: 0, brokenAfterDaysMissed: null })
  })
})

describe('lastSevenDays', () => {
  it('ends on today', () => {
    const days = lastSevenDays(new Date(2026, 8, 23, 22, 0))
    expect(days).toHaveLength(7)
    expect(days[0].key).toBe('2026-09-17')
    expect(days[6].key).toBe('2026-09-23')
  })
})
