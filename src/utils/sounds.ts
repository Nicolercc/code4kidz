import { useGameStore } from '../store/gameStore'

/**
 * Short feedback sounds, synthesised with the Web Audio API.
 *
 * These used to be Howler clips pointing at /assets/sounds/*.mp3 files that
 * were never added, so every sound 404'd silently. Generated tones need no
 * files and no dependency. The audio context is created on first use, which
 * is always after a click or keypress, so browsers allow it to start.
 */

type Note = { freq: number; start: number; duration: number }

const SOUNDS = {
  // Two rising notes: "ding-ding".
  correct: { wave: 'sine', volume: 0.18, notes: [{ freq: 660, start: 0, duration: 0.12 }, { freq: 880, start: 0.1, duration: 0.18 }] },
  // One soft low note: noticeable without feeling like a buzzer.
  wrong: { wave: 'triangle', volume: 0.15, notes: [{ freq: 220, start: 0, duration: 0.22 }] },
  // A short rising arpeggio for finishing a lesson.
  complete: {
    wave: 'sine',
    volume: 0.18,
    notes: [523, 659, 784, 1047].map((freq, i) => ({ freq, start: i * 0.11, duration: i === 3 ? 0.4 : 0.14 })),
  },
  xpPop: { wave: 'sine', volume: 0.12, notes: [{ freq: 1200, start: 0, duration: 0.06 }] },
} satisfies Record<string, { wave: OscillatorType; volume: number; notes: Note[] }>

export type SoundName = keyof typeof SOUNDS

let context: AudioContext | null = null

function audioContext(): AudioContext | null {
  if (context) return context
  const Ctor = globalThis.AudioContext as typeof AudioContext | undefined
  if (!Ctor) return null
  context = new Ctor()
  return context
}

export function play(name: SoundName): void {
  if (useGameStore.getState().isMuted) return
  try {
    const ctx = audioContext()
    if (!ctx) return
    if (ctx.state === 'suspended') void ctx.resume()
    const { wave, volume, notes } = SOUNDS[name]
    for (const { freq, start, duration } of notes) {
      const at = ctx.currentTime + start
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = wave
      osc.frequency.setValueAtTime(freq, at)
      // Quick fade out so notes do not click.
      gain.gain.setValueAtTime(volume, at)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
      osc.connect(gain).connect(ctx.destination)
      osc.start(at)
      osc.stop(at + duration)
    }
  } catch {
    // Sound is a nice-to-have; never let it break a lesson.
  }
}
