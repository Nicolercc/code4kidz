import { useEffect, useState } from 'react';
import TapToContinueHint from './TapToContinueHint';
import { useTapGate } from '../hooks/useTapGate';

export type BubbleMood = 'idle' | 'cheer' | 'think' | 'sad' | 'story';

const BUBBLE_STYLE: Record<BubbleMood, { bg: string; borderColor: string; text: string; borderW: string }> = {
  idle:  { bg: 'white',   borderColor: '#5C3EBC', text: '#1A1A2E', borderW: '3px' },
  cheer: { bg: '#D6F5E8', borderColor: '#1A7A4E', text: '#0F5C38', borderW: '4px' },
  think: { bg: '#FEF0D6', borderColor: '#D4581A', text: '#7A3A0A', borderW: '3px' },
  sad:   { bg: '#FDECE6', borderColor: '#B33A1C', text: '#7A1A0A', borderW: '3px' },
  story: { bg: '#FAE8F3', borderColor: '#8C2060', text: '#5C0A3A', borderW: '4px' },
};

export interface ByteTypewriterProps {
  text: string;
  mood: BubbleMood;
  /** When set, bubble is tappable and calls this. */
  onContinue?: () => void;
  /**
   * Show pulsing tap hint after 1.5s. Defaults to true if onContinue is set,
   * or use explicitly for parent-handled taps (e.g. full-screen splash).
   */
  showTapHint?: boolean;
  /** After lesson-intro bar fills, pulse the hint more visibly. */
  pulseStrength?: 'normal' | 'strong';
}

export default function ByteTypewriter({
  text,
  mood,
  onContinue,
  showTapHint,
  pulseStrength = 'normal',
}: ByteTypewriterProps) {
  const b = BUBBLE_STYLE[mood];
  const hintVisible = showTapHint ?? !!onContinue;

  const gate = useTapGate(
    () => {
      onContinue?.();
    },
    text,
    !!onContinue
  );

  const [passiveIndicator, setPassiveIndicator] = useState(false);
  useEffect(() => {
    if (onContinue) {
      setPassiveIndicator(false);
      return;
    }
    if (!hintVisible) {
      setPassiveIndicator(false);
      return;
    }
    setPassiveIndicator(false);
    const t = window.setTimeout(() => setPassiveIndicator(true), 1500);
    return () => window.clearTimeout(t);
  }, [text, onContinue, hintVisible]);

  const showIndicator = onContinue ? gate.indicatorVisible : passiveIndicator;
  const liveAnnounce = onContinue ? gate.announce : passiveIndicator ? 'Press space to continue' : '';

  const interactive = !!onContinue;

  return (
    <div
      {...(interactive ? gate.containerProps : {})}
      style={{
        background: b.bg,
        borderLeft: `${b.borderW} solid ${b.borderColor}`,
        borderRadius: 12,
        padding: '14px 16px',
        paddingBottom: hintVisible && showIndicator ? 36 : 16,
        fontSize: 16,
        lineHeight: 1.6,
        color: b.text,
        fontWeight: 500,
        position: 'relative',
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnounce}
      </span>

      {mood === 'story' && (
        <span
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 900,
            color: b.borderColor,
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Byte&apos;s Story
        </span>
      )}
      <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>

      {hintVisible && showIndicator && (
        <TapToContinueHint accentColor={b.borderColor} pulseStrength={pulseStrength} />
      )}
    </div>
  );
}
