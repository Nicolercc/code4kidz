import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function fakeAudioContext() {
  const notes: number[] = []
  class FakeContext {
    currentTime = 0
    state = 'running'
    destination = {}
    resume = vi.fn()
    createOscillator() {
      return {
        type: 'sine',
        frequency: { setValueAtTime: (f: number) => notes.push(f) },
        connect: () => ({ connect: () => {} }),
        start: vi.fn(),
        stop: vi.fn(),
      }
    }
    createGain() {
      return { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }
    }
  }
  return { FakeContext, notes }
}

/** Fresh modules per test: sounds.ts caches its AudioContext. */
async function load(isMuted: boolean) {
  const { useGameStore } = await import('../store/gameStore')
  useGameStore.setState({ isMuted })
  return (await import('./sounds')).play
}

describe('play', () => {
  beforeEach(() => vi.resetModules())
  afterEach(() => vi.unstubAllGlobals())

  it('synthesises a tone (no audio files to 404)', async () => {
    const { FakeContext, notes } = fakeAudioContext()
    vi.stubGlobal('AudioContext', FakeContext)
    const play = await load(false)
    play('correct')
    expect(notes).toEqual([660, 880])
  })

  it('stays silent when muted', async () => {
    const { FakeContext, notes } = fakeAudioContext()
    vi.stubGlobal('AudioContext', FakeContext)
    const play = await load(true)
    play('wrong')
    expect(notes).toHaveLength(0)
  })

  it('does nothing (and does not throw) where Web Audio is unavailable', async () => {
    vi.stubGlobal('AudioContext', undefined)
    const play = await load(false)
    expect(() => play('complete')).not.toThrow()
  })
})
