import { Howl } from 'howler'
import { useGameStore } from '../store/gameStore'

const tryLoad = (src: string[], volume: number) => {
  try { return new Howl({ src, volume }) } catch { return null }
}

export const sounds = {
  correct: tryLoad(['/assets/sounds/correct-ping.mp3'], 0.6),
  wrong: tryLoad(['/assets/sounds/wrong-buzz.mp3'], 0.4),
  complete: tryLoad(['/assets/sounds/win-fanfare.mp3'], 0.7),
  xpPop: tryLoad(['/assets/sounds/xp-pop.mp3'], 0.5),
}

export const play = (sound: keyof typeof sounds) => {
  if (useGameStore.getState().isMuted) return
  sounds[sound]?.play()
}