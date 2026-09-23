import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

export interface UseTapGateResult {
  /**
   * Spread onto the tappable area so a tap anywhere continues. It is not a
   * control itself (no role, label or tab stop), so its text stays readable.
   */
  regionProps: { onClick: (e: MouseEvent) => void };
  /** Spread onto the real <ContinueButton>: the keyboard and screen reader path. */
  buttonProps: {
    onClick: (e: MouseEvent) => void;
    ref: (el: HTMLButtonElement | null) => void;
  };
}

/**
 * "Tap to continue" for screens that pause on a message.
 *
 * This used to give the whole area role="button" plus an aria-label, which
 * replaced the message with "Press space or tap to continue" for screen reader
 * users. Now the area only handles pointer taps and a real button carries the
 * keyboard / assistive-tech path. The button takes focus when the gate opens,
 * so Enter continues straight away.
 */
export function useTapGate(onAdvance: () => void, active = true): UseTapGateResult {
  const onAdvanceRef = useRef(onAdvance);
  useEffect(() => {
    onAdvanceRef.current = onAdvance;
  });

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (active) buttonRef.current?.focus();
  }, [active]);

  const advance = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    onAdvanceRef.current();
  }, []);

  const setButton = useCallback((el: HTMLButtonElement | null) => {
    buttonRef.current = el;
  }, []);

  return {
    regionProps: { onClick: advance },
    buttonProps: { onClick: advance, ref: setButton },
  };
}
