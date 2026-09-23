import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { checkStreak, localDateKey, recordPractice } from '../lesson/streak'

export type MascotMood = 'idle' | 'cheer' | 'think' | 'sad' | 'story' | 'celebrate'

export interface MistakeEntry {
  stepId: string
  failCount: number
  instruction: string
  startingCode: string
}

const MAX_HEARTS = 3

interface GameState {
  // Identity
  topicName: string

  // Progress
  completedLessons: string[]
  currentStepIndex: number

  // Gamification
  xp: number
  hearts: number
  heartsLostThisLesson: number
  streak: number
  /** Local "YYYY-MM-DD" of the last passed step (see lesson/streak.ts). */
  lastPracticeDate: string
  playedDates: string[]
  /** Set on app open when a streak of 2+ just ended; drives the "streak broke" screen. */
  streakBrokenAfterDaysMissed: number | null
  isMuted: boolean

  // Lesson state
  code: string
  mascotMood: MascotMood
  byteMessage: string

  /** Steps the learner needed more than one check for, per lesson, for the review screen. */
  mistakeLog: Record<string, MistakeEntry[]>

  // Actions
  setTopic: (name: string) => void
  gainXP: (amount: number) => void
  loseHeart: () => void
  refillHearts: () => void
  advanceStep: () => void
  resetToStep: (index: number) => void
  updateCode: (code: string) => void
  setMascotMood: (mood: MascotMood, message: string) => void
  recordMistake: (lessonId: string, entry: MistakeEntry) => void
  clearMistakeLog: (lessonId: string) => void
  markLessonComplete: (lessonId: string) => void
  /** Call when a step passes: counts today toward the streak. */
  recordPractice: () => void
  /** Call when the app opens: ends the streak after a missed day. */
  checkStreak: () => void
  toggleMute: () => void
  dismissStreakBroken: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      topicName: '',
      completedLessons: [],
      currentStepIndex: 0,
      xp: 0,
      hearts: MAX_HEARTS,
      heartsLostThisLesson: 0,
      streak: 0,
      lastPracticeDate: '',
      playedDates: [],
      streakBrokenAfterDaysMissed: null,
      isMuted: false,
      code: '',
      mascotMood: 'idle',
      byteMessage: '',
      mistakeLog: {},

      setTopic: (name) => set({ topicName: name }),

      gainXP: (amount) => set((s) => ({ xp: s.xp + amount })),

      // The message says how many hearts are left, so the loss is not shown by the heart icons alone.
      loseHeart: () => set((s) => {
        const hearts = Math.max(0, s.hearts - 1)
        return {
          hearts,
          heartsLostThisLesson: s.heartsLostThisLesson + 1,
          mascotMood: 'sad',
          byteMessage: hearts === 0
            ? 'That was your last heart. Take a breath, then start this lesson again with full hearts.'
            : `Oops, that cost a heart. ${hearts} ${hearts === 1 ? 'heart' : 'hearts'} left. Every coder gets this wrong sometimes.`,
        }
      }),

      refillHearts: () => set({ hearts: MAX_HEARTS }),

      advanceStep: () => set((s) => ({
        currentStepIndex: s.currentStepIndex + 1,
        code: '',
      })),

      resetToStep: (index) => set({ currentStepIndex: index }),

      updateCode: (code) => set({ code }),

      setMascotMood: (mood, message) => set({ mascotMood: mood, byteMessage: message }),

      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

      dismissStreakBroken: () => set({ streakBrokenAfterDaysMissed: null }),

      recordMistake: (lessonId, entry) => set((s) => ({
        mistakeLog: {
          ...s.mistakeLog,
          [lessonId]: [...(s.mistakeLog[lessonId] ?? []), entry],
        },
      })),

      clearMistakeLog: (lessonId) => set((s) => {
        const log = { ...s.mistakeLog }
        delete log[lessonId]
        return { mistakeLog: log }
      }),

      markLessonComplete: (lessonId) => set((s) => ({
        completedLessons: s.completedLessons.includes(lessonId) ? s.completedLessons : [...s.completedLessons, lessonId],
        currentStepIndex: 0,
        hearts: MAX_HEARTS,
        heartsLostThisLesson: 0,
        code: '',
      })),

      recordPractice: () => set((s) => recordPractice(s, localDateKey())),

      checkStreak: () => {
        const { streak, brokenAfterDaysMissed } = checkStreak(get(), localDateKey())
        set({ streak, ...(brokenAfterDaysMissed !== null ? { streakBrokenAfterDaysMissed: brokenAfterDaysMissed } : {}) })
      },
    }),
    {
      name: 'code4kidz-store',
      version: 1,
      // v0 stored the last visit as toDateString() under lastPlayedDate and
      // counted app opens rather than practice.
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>
        if (version < 1) {
          const last = typeof state.lastPlayedDate === 'string' && state.lastPlayedDate
          state.lastPracticeDate = last ? localDateKey(new Date(last)) : ''
          state.streakBrokenAfterDaysMissed = null
          for (const key of ['lastPlayedDate', 'streakJustBroke', 'classroomCode', 'currentLessonId', 'failCount', 'hintsUsed', 'hasEditedCurrentStep', 'voiceEnabled']) {
            delete state[key]
          }
        }
        return state as unknown as GameState
      },
    },
  ),
)
