/**
 * Daily streak rules, as pure functions of calendar days in the learner's own
 * time zone. Dates are "YYYY-MM-DD" keys so they compare, sort and store
 * cleanly. (The old code mixed local toDateString() with UTC toISOString(),
 * so evenings in the Americas landed on the wrong day.)
 */

export interface StreakFields {
  streak: number
  /** Day of the last practice (a passed step), or '' if never. */
  lastPracticeDate: string
  /** Recent days with practice, oldest first, for the 7-day calendar. */
  playedDates: string[]
}

const HISTORY_DAYS = 30

/** "YYYY-MM-DD" for the learner's local calendar day. */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Whole calendar days from `from` to `to` (DST-safe: compares dates, not hours). */
export function daysBetween(from: string, to: string): number {
  const toUtc = (key: string) => {
    const [y, m, d] = key.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000)
}

/** Call when the learner practises (passes a step). Grows the streak once per day. */
export function recordPractice(s: StreakFields, today: string): StreakFields {
  if (s.lastPracticeDate === today) return s
  const continues = s.lastPracticeDate !== '' && daysBetween(s.lastPracticeDate, today) === 1
  const playedDates = [...new Set([...s.playedDates, today])].sort().slice(-HISTORY_DAYS)
  return { streak: continues ? s.streak + 1 : 1, lastPracticeDate: today, playedDates }
}

export interface StreakCheck {
  streak: number
  /** Days with no practice that ended a streak of 2+, or null if nothing broke. */
  brokenAfterDaysMissed: number | null
}

/** Call when the app opens: a gap of a full day or more ends the streak. */
export function checkStreak(s: StreakFields, today: string): StreakCheck {
  if (!s.lastPracticeDate) return { streak: s.streak, brokenAfterDaysMissed: null }
  const daysMissed = daysBetween(s.lastPracticeDate, today) - 1
  if (daysMissed < 1) return { streak: s.streak, brokenAfterDaysMissed: null }
  return { streak: 0, brokenAfterDaysMissed: s.streak >= 2 ? daysMissed : null }
}

/** The last 7 local days ending today, with short weekday labels. */
export function lastSevenDays(today: Date = new Date()): { key: string; label: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - i))
    return { key: localDateKey(d), label: d.toLocaleDateString(undefined, { weekday: 'short' }) }
  })
}
