import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { stopSpeaking } from '../utils/voice'

export type MascotMood = 'idle' | 'cheer' | 'think' | 'sad' | 'story' | 'celebrate'

export interface MistakeEntry {
  stepId: string
  failCount: number
  instruction: string
  startingCode: string
}

interface GameState {
  // Identity
  topicName: string
  classroomCode: string

  // Progress
  currentLessonId: string
  completedLessons: string[]
  currentStepIndex: number

  // Gamification
  xp: number
  hearts: number
  heartsLostThisLesson: number
  streak: number
  lastPlayedDate: string
  playedDates: string[]
  streakJustBroke: boolean
  isMuted: boolean
  voiceEnabled: boolean

  // Lesson state
  code: string
  failCount: number
  hintsUsed: number
  mascotMood: MascotMood
  byteMessage: string

  // FIX 3: tracks whether the kid has typed at least once on the current step
  hasEditedCurrentStep: boolean

  // Mistake tracking (session only — NOT persisted)
  mistakeLog: Record<string, MistakeEntry[]>

  // Actions
  setTopic: (name: string) => void
  setClassroomCode: (code: string) => void
  gainXP: (amount: number) => void
  loseHeart: () => void
  refillHearts: () => void
  advanceStep: () => void
  resetToStep: (index: number) => void
  updateCode: (code: string) => void
  incrementFail: () => void
  resetFail: () => void
  setMascotMood: (mood: MascotMood, message: string) => void
  recordMistake: (lessonId: string, entry: MistakeEntry) => void
  clearMistakeLog: (lessonId: string) => void
  markLessonComplete: (lessonId: string) => void
  checkAndUpdateStreak: () => void
  setHasEdited: () => void
  toggleMute: () => void
  toggleVoiceEnabled: () => void
  dismissStreakBroken: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      topicName: '',
      classroomCode: '',
      currentLessonId: 'lesson-01',
      completedLessons: [],
      currentStepIndex: 0,
      xp: 0,
      hearts: 3,
      heartsLostThisLesson: 0,
      streak: 0,
      lastPlayedDate: '',
      playedDates: [],
      streakJustBroke: false,
      isMuted: false,
      voiceEnabled: true,
      code: '',
      failCount: 0,
      hintsUsed: 0,
      mascotMood: 'idle',
      byteMessage: '',
      hasEditedCurrentStep: false,
      mistakeLog: {},

      setTopic: (name) => set({ topicName: name }),
      setClassroomCode: (code) => set({ classroomCode: code }),

      gainXP: (amount) => set((s) => ({ xp: s.xp + amount })),

      loseHeart: () => set((s) => ({
        hearts: Math.max(0, s.hearts - 1),
        heartsLostThisLesson: s.heartsLostThisLesson + 1,
        mascotMood: 'sad',
        byteMessage: s.hearts === 1
          ? "That was your last heart. Take a breath — you can try again tomorrow with full hearts!"
          : "Oops! That is okay. Every coder gets this wrong sometimes."
      })),

      refillHearts: () => set({ hearts: 3 }),

      advanceStep: () => set((s) => ({
        currentStepIndex: s.currentStepIndex + 1,
        failCount: 0,
        hintsUsed: 0,
        code: '',
        hasEditedCurrentStep: false,
      })),

      resetToStep: (index) => set({ currentStepIndex: index, failCount: 0, hintsUsed: 0, hasEditedCurrentStep: false }),

      updateCode: (code) => set({ code }),

      incrementFail: () => set((s) => ({ failCount: s.failCount + 1 })),

      resetFail: () => set({ failCount: 0, hintsUsed: 0 }),

      setMascotMood: (mood, message) => set({ mascotMood: mood, byteMessage: message }),

      setHasEdited: () => set({ hasEditedCurrentStep: true }),

      toggleMute: () => set((s) => {
        const nextMuted = !s.isMuted
        if (nextMuted) stopSpeaking()
        return { isMuted: nextMuted }
      }),

      toggleVoiceEnabled: () => set((s) => {
        const next = !s.voiceEnabled
        if (!next) stopSpeaking()
        return { voiceEnabled: next }
      }),

      dismissStreakBroken: () => set({ streakJustBroke: false }),

      recordMistake: (lessonId, entry) => set((s) => ({
        mistakeLog: {
          ...s.mistakeLog,
          [lessonId]: [...(s.mistakeLog[lessonId] ?? []), entry]
        }
      })),

      clearMistakeLog: (lessonId) => set((s) => {
        const log = { ...s.mistakeLog }
        delete log[lessonId]
        return { mistakeLog: log }
      }),

      markLessonComplete: (lessonId) => set((s) => ({
        completedLessons: [...s.completedLessons, lessonId],
        currentStepIndex: 0,
        hearts: 3,
        heartsLostThisLesson: 0,
        failCount: 0,
        hintsUsed: 0,
        code: '',
        hasEditedCurrentStep: false,
      })),

      checkAndUpdateStreak: () => {
        const now = new Date()
        const todayStr = now.toDateString()
        const todayISO = now.toISOString().slice(0, 10)
        const { lastPlayedDate, streak, playedDates } = get()
        if (lastPlayedDate === todayStr) return

        const last = lastPlayedDate ? new Date(lastPlayedDate) : null
        const daysSince = last ? Math.floor((now.getTime() - last.getTime()) / 86400000) : 0
        const missedMoreThanOneDay = lastPlayedDate !== '' && daysSince > 1
        const broke = missedMoreThanOneDay && streak >= 2

        const nextStreak = (!lastPlayedDate || daysSince <= 1) ? streak + 1 : 1

        const nextPlayed = (() => {
          const setIso = new Set(playedDates)
          setIso.add(todayISO)
          const sorted = Array.from(setIso).sort()
          return sorted.slice(Math.max(0, sorted.length - 30))
        })()

        set({
          streak: nextStreak,
          lastPlayedDate: todayStr,
          playedDates: nextPlayed,
          streakJustBroke: broke,
        })
      },
    }),
    {
      name: 'code4kidz-store',
      partialize: (s) => {
        const { hasEditedCurrentStep, mistakeLog, ...rest } = s
        return rest
      }
    }
  )
)
