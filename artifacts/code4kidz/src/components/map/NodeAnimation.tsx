import { useEffect, useMemo, useState } from 'react';

export type NodeAnimationProps = {
  lessonId: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  return reduced;
}

function CheckmarkOnce({ reduced }: { reduced: boolean }) {
  return (
    <div className="node-anim node-anim--check" aria-hidden>
      <svg
        viewBox="0 0 64 64"
        width="18"
        height="18"
        className={reduced ? 'node-check-static' : 'node-check-once'}
        style={{ position: 'absolute', bottom: 6, right: 6 }}
      >
        <path
          d="M18 34.5 27.5 44 46 24"
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function LockedIcon() {
  return (
    <div className="node-anim node-anim--locked" aria-hidden>
      <svg viewBox="0 0 64 64" width="14" height="14" className="node-lock-corner">
        <path
          d="M22 28v-6c0-5.5 4.5-10 10-10s10 4.5 10 10v6"
          fill="none"
          stroke="white"
          strokeOpacity="0.8"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <rect
          x="18"
          y="28"
          width="28"
          height="24"
          rx="6"
          fill="none"
          stroke="white"
          strokeOpacity="0.9"
          strokeWidth="4.5"
        />
        <circle cx="32" cy="40" r="3.2" fill="white" fillOpacity="0.9" />
      </svg>
    </div>
  );
}

function Lesson1HtmlBreath({ reduced }: { reduced: boolean }) {
  return (
    <div className="node-anim node-anim--lesson1" aria-hidden>
      <svg
        viewBox="0 0 64 64"
        width="38"
        height="38"
        className={reduced ? 'node-static' : 'node-html-breath'}
      >
        <path
          d="M27 20 18 32l9 12"
          fill="none"
          stroke="white"
          strokeOpacity="0.92"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37 20 46 32l-9 12"
          fill="none"
          stroke="white"
          strokeOpacity="0.92"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Lesson2AaWave({ reduced }: { reduced: boolean }) {
  return (
    <div className="node-anim node-anim--lesson2" aria-hidden>
      <svg viewBox="0 0 64 64" width="44" height="44" className="node-aa">
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fillOpacity="0.92"
          className={reduced ? 'node-aa-static' : 'node-aa-wave'}
          style={{
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
            fontWeight: 900,
          }}
        >
          Aa
        </text>
      </svg>
    </div>
  );
}

function Lesson3TypeLine({ reduced }: { reduced: boolean }) {
  return (
    <div className="node-anim node-anim--lesson3" aria-hidden>
      <svg viewBox="0 0 64 64" width="44" height="44">
        <rect
          x="10"
          y="31"
          width="44"
          height="2.6"
          rx="1.3"
          fill="white"
          fillOpacity="0.9"
          className={reduced ? 'node-typeline-static' : 'node-typeline'}
        />
      </svg>
    </div>
  );
}

function Lesson4HueGlow({ reduced }: { reduced: boolean }) {
  return (
    <div className="node-anim node-anim--lesson4" aria-hidden>
      <div className={reduced ? 'node-hueglow-static' : 'node-hueglow'} />
    </div>
  );
}

function Lesson5ListStagger({ reduced }: { reduced: boolean }) {
  return (
    <div className="node-anim node-anim--lesson5" aria-hidden>
      <svg viewBox="0 0 64 64" width="44" height="44">
        <rect x="16" y="22" width="32" height="3" rx="1.5" fill="white" fillOpacity="0.9" className={reduced ? 'node-list-static' : 'node-list-a'} />
        <rect x="16" y="30.5" width="32" height="3" rx="1.5" fill="white" fillOpacity="0.9" className={reduced ? 'node-list-static' : 'node-list-b'} />
        <rect x="16" y="39" width="32" height="3" rx="1.5" fill="white" fillOpacity="0.9" className={reduced ? 'node-list-static' : 'node-list-c'} />
      </svg>
    </div>
  );
}

function Lesson6PictureDash({ reduced }: { reduced: boolean }) {
  return (
    <div className="node-anim node-anim--lesson6" aria-hidden>
      <svg viewBox="0 0 64 64" width="44" height="44">
        <rect
          x="16"
          y="18"
          width="32"
          height="28"
          rx="5"
          fill="none"
          stroke="white"
          strokeOpacity="0.9"
          strokeWidth="3.2"
          strokeDasharray="8 6"
          className={reduced ? 'node-photo-static' : 'node-photo-dash'}
        />
        <circle cx="26" cy="27" r="2.6" fill="white" fillOpacity="0.85" />
        <path d="M20 42l10-10 6 6 8-8 8 12" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function NodeAnimation({ lessonId, isCompleted, isCurrent, isLocked }: NodeAnimationProps) {
  const reduced = usePrefersReducedMotion();

  const lessonNum = useMemo(() => {
    const m = lessonId.match(/lesson-(\d+)/);
    return m ? Number(m[1]) : NaN;
  }, [lessonId]);

  // Completed: keep emoji visible; show a small one-shot checkmark badge.
  if (isCompleted) return <CheckmarkOnce reduced={reduced} />;

  // Locked nodes: no animation, static lock icon in corner.
  if (isLocked) return <LockedIcon />;

  // Current runs lesson-specific animation behind the emoji.
  // Non-current unlocked nodes: keep settled to reduce noise + perf.
  const animate = isCurrent && !reduced;
  if (!animate) return null;

  switch (lessonNum) {
    case 1:
      return <Lesson1HtmlBreath reduced={false} />;
    case 2:
      return <Lesson2AaWave reduced={false} />;
    case 3:
      return <Lesson3TypeLine reduced={false} />;
    case 4:
      return <Lesson4HueGlow reduced={false} />;
    case 5:
      return <Lesson5ListStagger reduced={false} />;
    case 6:
      return <Lesson6PictureDash reduced={false} />;
    default:
      return null;
  }
}

