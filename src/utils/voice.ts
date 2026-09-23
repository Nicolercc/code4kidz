import { useGameStore } from '../store/gameStore';

export interface VoiceConfig {
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
}

export const DEFAULT_CONFIG: VoiceConfig = {
  rate: 0.75,
  pitch: 1.15,
  volume: 0.85,
};

// Priority order for kid-friendly voices (best-effort, varies by OS/browser).
const PREFERRED_VOICE_NAMES = [
  'Google US English',
  'Samantha',
  'Microsoft Zira',
  'Alex',
  'Google UK English Female',
];

export const getBestVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  for (const name of PREFERRED_VOICE_NAMES) {
    const found = voices.find((v) => v.name === name);
    if (found) return found;
  }

  return voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ?? null;
};

export const speak = (text: string, config?: Partial<VoiceConfig>) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const trimmed = text?.trim();
  if (!trimmed) return;

  const { isMuted, voiceEnabled } = useGameStore.getState();
  if (isMuted || !voiceEnabled) return;

  // Never overlap speech.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  const voice = config?.voice ?? getBestVoice();
  if (voice) utterance.voice = voice;

  utterance.rate = config?.rate ?? DEFAULT_CONFIG.rate;
  utterance.pitch = config?.pitch ?? DEFAULT_CONFIG.pitch;
  utterance.volume = config?.volume ?? DEFAULT_CONFIG.volume;

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (typeof window === 'undefined') return;
  window.speechSynthesis?.cancel();
};

// Voices load asynchronously in many browsers — wait for them.
export const initVoices = (): Promise<void> => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return Promise.resolve();

  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing && existing.length > 0) {
      resolve();
      return;
    }

    const done = () => resolve();
    window.speechSynthesis.onvoiceschanged = done;

    // Safety: resolve even if onvoiceschanged never fires.
    window.setTimeout(done, 1500);
  });
};

