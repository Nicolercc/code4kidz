import type { AnimationItem } from 'lottie-web';

/**
 * If the user prefers reduced motion, show frame 0 only (no looping).
 * Call after loadAnimation(); safe if anim is null.
 */
export function pauseLottieIfReducedMotion(anim: AnimationItem | null | undefined): void {
  if (!anim) return;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      anim.goToAndStop(0, true);
    }
  } catch {
    /* ignore */
  }
}

/** True when system requests reduced motion (Lottie / canvas should stay static). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
