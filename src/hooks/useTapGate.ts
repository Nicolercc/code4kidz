import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { stopSpeaking } from '../utils/voice';

export interface UseTapGateResult {
  /** Text is always shown in full immediately — always true when active. */
  isReady: boolean;
  /** True 1.5s after mount or after resetKey changes (when active). */
  indicatorVisible: boolean;
  /** For screen readers when the tap hint becomes available. */
  announce: string;
  /** Spread onto the tappable container (bubble, card, or full-screen region). */
  containerProps: {
    role: 'button';
    tabIndex: 0;
    'aria-label': string;
    onClick: (e: MouseEvent) => void;
    onKeyDown: (e: KeyboardEvent) => void;
  };
}

/**
 * Tap / click / Space / Enter to call onAdvance.
 * No network; works with keyboard and touch.
 * @param active When false, indicator and timers are cleared (e.g. bubble hidden).
 */
export function useTapGate(
  onAdvance: () => void,
  resetKey?: string | number,
  active = true
): UseTapGateResult {
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const [announce, setAnnounce] = useState('');
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    if (!active) {
      setIndicatorVisible(false);
      setAnnounce('');
      return;
    }
    setIndicatorVisible(false);
    setAnnounce('');
    const t = window.setTimeout(() => {
      setIndicatorVisible(true);
      setAnnounce('Press space to continue');
    }, 1500);
    return () => window.clearTimeout(t);
  }, [active, resetKey]);

  const advance = useCallback((e?: MouseEvent) => {
    e?.stopPropagation();
    stopSpeaking();
    onAdvanceRef.current();
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        stopSpeaking();
        onAdvanceRef.current();
      }
    },
    []
  );

  const containerProps = useMemo(
    () => ({
      role: 'button' as const,
      tabIndex: 0 as const,
      'aria-label': 'Press space or tap to continue',
      onClick: advance,
      onKeyDown,
    }),
    [advance, onKeyDown]
  );

  return {
    isReady: active,
    indicatorVisible,
    announce,
    containerProps,
  };
}
