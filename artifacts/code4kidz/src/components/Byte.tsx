import { useCallback, useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import type { MascotMood } from "../store/gameStore";
import TapToContinueHint from "./TapToContinueHint";
import { useTapGate } from "../hooks/useTapGate";

// ─── Types ──────────────────────────────────────────────────────────────────
export type ByteState = "idle" | "story" | "think" | "cheer" | "sad" | "celebrate";

interface ByteProps {
  mood?: MascotMood;
  size?: number;
  showSpeech?: boolean;
  /** Optional override for the speech bubble text (Map / special moments). */
  speechText?: string;
  /** Required when showSpeech is true: tap dismisses the bubble and runs this. */
  onSpeechContinue?: () => void;
  className?: string;
  onStateEnd?: () => void;
  justPassed?: boolean;
  justFailed?: boolean;
  isTyping?: boolean;
  justAdvanced?: boolean;
  lessonMount?: boolean;
  waveOnMount?: boolean;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return reduced;
}

// Map MascotMood → ByteState
function moodToState(mood: MascotMood): ByteState {
  if (mood === "story") return "story";
  if (mood === "celebrate") return "celebrate";
  return mood as ByteState;
}

// ─── Speech lines per state ──────────────────────────────────────────────────
const LINES: Record<ByteState, string[]> = {
  idle: [
    "Hi!! I'm Byte — your robot buddy! 👋",
    "Boop boop. Nice to meet you!",
    "Let's build something cool together!",
    "I run on electricity and good vibes ⚡",
    "Ready when you are!",
    "*blinks* Oh! You're here! Hi! 🤖",
    "My circuits are SO happy to see you!",
  ],
  story: [
    "Psst... story time.",
    "Okay... let me tell you something.",
    "This is a Byte story.",
  ],
  think: [
    "Hmm... my circuits are tingling 🔌",
    "Calculating... this may take a nanosecond",
    "Big brain moment incoming 🧠",
    "Beep boop... I'm thinking, I promise",
    "Consulting the robot elders...",
  ],
  cheer: [
    "YES!! You actually did it!! 🎉",
    "LETS GOOO!! 🚀🚀🚀",
    "I knew you had it in you!!",
    "BEEP BOOP — that means AMAZING 🤖✨",
    "That was so clean!! I'm literally glowing",
    "You just leveled up!! 🏆",
  ],
  sad: [
    "Oops! Happens to the best robots 💛",
    "That's okay, even I crash sometimes",
    "Error? More like learning opportunity 😌",
    "Nope — but you're SO close!",
    "Every wrong answer = XP for your brain 🧠",
  ],
  celebrate: [
    "LESSON COMPLETE!! You're a LEGEND 👑",
    "FULL MARKS!! I'm telling the whole school 📣",
    "You just broke Byte. I'm too happy 💥",
    "SCREAMING!! That was PERFECT!!",
  ],
};

const randomLine = (state: ByteState) => {
  const lines = LINES[state];
  return lines[Math.floor(Math.random() * lines.length)];
};

// ─── SVG Variants ────────────────────────────────────────────────────────────
const headVariants = {
  idle:      { rotate: 0,   x: 0,  y: 0,   transition: { type: "spring" as const, stiffness: 200, damping: 18 } },
  story:     { rotate: 0,   x: 0,  y: 0,   transition: { type: "spring" as const, stiffness: 200, damping: 18 } },
  think:     { rotate: -13, x: -3, y: 0,   transition: { type: "spring" as const, stiffness: 180, damping: 16 } },
  cheer:     { rotate: 4,   x: 0,  y: -6,  transition: { type: "spring" as const, stiffness: 300, damping: 12 } },
  sad:       { rotate: 9,   x: 2,  y: 6,   transition: { type: "spring" as const, stiffness: 160, damping: 20 } },
  celebrate: { rotate: 0,   x: 0,  y: -10, transition: { type: "spring" as const, stiffness: 320, damping: 10 } },
};

const bodyVariants = {
  idle:      { scaleX: 1,    scaleY: 1,    y: 0,   transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
  story:     { scaleX: 1,    scaleY: 1,    y: 0,   transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
  think:     { scaleX: 0.98, scaleY: 1,    y: 2,   transition: { type: "spring" as const, stiffness: 180, damping: 20 } },
  cheer:     { scaleX: 1.06, scaleY: 0.94, y: -8,  transition: { type: "spring" as const, stiffness: 340, damping: 10 } },
  sad:       { scaleX: 0.94, scaleY: 1.03, y: 6,   transition: { type: "spring" as const, stiffness: 160, damping: 22 } },
  celebrate: { scaleX: 1.08, scaleY: 0.92, y: -14, transition: { type: "spring" as const, stiffness: 380, damping: 8  } },
};

const leftArmVariants = {
  idle:      { rotate: 0,   x: 0,  y: 0,   transition: { type: "spring" as const, stiffness: 200, damping: 18 } },
  story:     { rotate: 0,   x: 0,  y: 0,   transition: { type: "spring" as const, stiffness: 200, damping: 18 } },
  think:     { rotate: 12,  x: 0,  y: 4,   transition: { type: "spring" as const, stiffness: 180, damping: 18 } },
  cheer:     { rotate: -85, x: -6, y: -18, transition: { type: "spring" as const, stiffness: 260, damping: 12 } },
  sad:       { rotate: 22,  x: 2,  y: 8,   transition: { type: "spring" as const, stiffness: 160, damping: 22 } },
  celebrate: { rotate: -95, x: -8, y: -22, transition: { type: "spring" as const, stiffness: 300, damping: 9  } },
};

const rightArmVariants = {
  idle:      { rotate: 0,   x: 0,  y: 0,   transition: { type: "spring" as const, stiffness: 200, damping: 18 } },
  story:     { rotate: 0,   x: 0,  y: 0,   transition: { type: "spring" as const, stiffness: 200, damping: 18 } },
  think:     { rotate: -68, x: 8,  y: -22, transition: { type: "spring" as const, stiffness: 220, damping: 14 } },
  cheer:     { rotate: 85,  x: 6,  y: -18, transition: { type: "spring" as const, stiffness: 260, damping: 12 } },
  sad:       { rotate: -22, x: -2, y: 8,   transition: { type: "spring" as const, stiffness: 160, damping: 22 } },
  celebrate: { rotate: 95,  x: 8,  y: -22, transition: { type: "spring" as const, stiffness: 300, damping: 9  } },
};

const MOUTH: Record<ByteState, string> = {
  idle:      "M72 103 Q90 115 108 103",
  story:     "M72 103 Q90 115 108 103",
  think:     "M76 106 Q90 109 104 106",
  cheer:     "M66 100 Q90 122 114 100",
  sad:       "M74 111 Q90 100 106 111",
  celebrate: "M63 98  Q90 126 117 98",
};

const EYE_SCALE: Record<ByteState, { left: number; right: number }> = {
  idle:      { left: 1,    right: 1    },
  story:     { left: 1,    right: 1    },
  think:     { left: 0.35, right: 1    },
  cheer:     { left: 0.45, right: 0.45 },
  sad:       { left: 0.55, right: 0.55 },
  celebrate: { left: 0.45, right: 0.45 },
};

// ─── Per-state continuous float loop ─────────────────────────────────────────
function floatAnimate(state: ByteState, isCheer: boolean) {
  if (isCheer) {
    return {
      y: [0, -20, -5, -15, -3, 0],
      transition: { duration: 0.75, repeat: Infinity, repeatDelay: 0.55, ease: "easeOut" as const },
    };
  }
  switch (state) {
    case "story":
      return {
        y: [0, -4, 0],
        transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const },
      };
    case "think":
      return {
        y: [0, -3, 0],
        rotate: [0, -1.5, 0],
        transition: { duration: 2.0, repeat: Infinity, ease: "easeInOut" as const },
      };
    case "sad":
      return {
        y: [0, 4, 0],
        rotate: [0, 1.2, 0, -1.2, 0],
        transition: { duration: 4.2, repeat: Infinity, ease: "easeInOut" as const },
      };
    default: // idle / story
      return {
        y: [0, -6, 0],
        rotate: [0, 0.9, 0, -0.9, 0],
        transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" as const },
      };
  }
}

function storyLean(state: ByteState) {
  return state === "story" ? -3 : 0;
}

// ─── Bubble colour by state ───────────────────────────────────────────────────
function bubbleColour(state: ByteState) {
  switch (state) {
    case "cheer":
    case "celebrate":
      return { bg: "#dcfce7", border: "#22c55e", text: "#15803d", hintMuted: "rgba(21,128,61,0.45)" };
    case "think":
      return { bg: "#fff7ed", border: "#f97316", text: "#c2410c", hintMuted: "rgba(194,65,12,0.45)" };
    case "sad":
      return { bg: "#fef2f2", border: "#ef4444", text: "#b91c1c", hintMuted: "rgba(185,28,28,0.45)" };
    default:
      return { bg: "#ffffff", border: "#22c55e", text: "#15803d", hintMuted: "rgba(21,128,61,0.45)" };
  }
}

// ─── Star burst particles on pass ────────────────────────────────────────────
const BURST_ANGLES = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
const BURST_COLORS = ['#facc15', '#fde047', '#22c55e', '#4ade80', '#a78bfa', '#fb923c', '#f472b6', '#38bdf8'];

interface BurstProps { size: number; show: boolean }
const BurstParticles = memo(function BurstParticles({ size, show }: BurstProps) {
  if (!show) return null;
  const radius = size * 0.5;
  const baseDelay = 0.35; // fire near jump peak
  return (
    <>
      {BURST_ANGLES.map((angle, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: BURST_COLORS[i % BURST_COLORS.length],
            pointerEvents: "none",
            zIndex: 30,
            marginLeft: -5,
            marginTop: -5,
          }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            scale: [0, 1.4, 1, 0],
            opacity: [1, 1, 0.7, 0],
          }}
          transition={{ duration: 0.75, delay: baseDelay + i * 0.03, ease: "easeOut" }}
        />
      ))}
    </>
  );
});
BurstParticles.displayName = "BurstParticles";

// ─── Sparkle ─────────────────────────────────────────────────────────────────
const Sparkle = memo(({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) => (
  <motion.text
    x={x} y={y}
    fontSize={size}
    fill="#facc15"
    textAnchor="middle"
    initial={{ opacity: 0, scale: 0, rotate: -20 }}
    animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.3, 1, 0], rotate: [0, 15, -10, 0] }}
    transition={{ delay, duration: 0.8, repeat: Infinity, repeatDelay: 1.2 }}
  >★</motion.text>
));
Sparkle.displayName = "Sparkle";

// ─── Main Component ───────────────────────────────────────────────────────────
const Byte = memo(function Byte({
  mood = "idle",
  size = 120,
  showSpeech = false,
  speechText,
  onSpeechContinue,
  className = "",
  onStateEnd,
  justPassed = false,
  justFailed = false,
  justAdvanced = false,
  lessonMount = false,
  waveOnMount = false,
}: ByteProps) {
  const state = moodToState(mood);
  const isCheer = state === "cheer" || state === "celebrate";
  const prefersReducedMotion = usePrefersReducedMotion();

  // Container ref for pupil tracking
  const containerRef = useRef<HTMLDivElement>(null);
  // Pupil offset (mouse-tracked, lerped)
  const [pupilOff, setPupilOff] = useState({ x: 0, y: 0 });
  const targetPupilRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const glanceControls = useAnimation();
  const lastPointerMoveAtRef = useRef<number>(0);

  // One-shot effects on cheer
  const [cheerPulseKey, setCheerPulseKey] = useState(0);
  // Right arm wave
  const rightArmWaveControls = useAnimation();
  const [isWaving, setIsWaving] = useState(false);
  // Think lightbulb
  const [showLightbulb, setShowLightbulb] = useState(false);

  // Speech bubble state
  const [speech, setSpeech] = useState(() => speechText ?? randomLine(state));
  const [showBubble, setShowBubble] = useState(false);
  const prevState = useRef<ByteState | null>(null);

  // Reactive animation controls (shake / jump)
  const reactiveControls = useAnimation();

  // Blinking (scale multiplier applied on top of expression squint)
  const [blinkScale, setBlinkScale] = useState(1);
  const blinkInFlightRef = useRef(false);
  const blinkTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // LED cycling for think state
  const [activeLed, setActiveLed] = useState(1);

  // ── Blinking loop ──
  useEffect(() => {
    if (state === "sad" || state === "think") return;

    const clearBlinkTimers = () => {
      blinkTimersRef.current.forEach(clearTimeout);
      blinkTimersRef.current = [];
    };

    const runBlink = (double = false) => {
      if (blinkInFlightRef.current) return;
      blinkInFlightRef.current = true;

      const closeMs = 120;
      const holdMs = 60;
      const openMs = 120;

      const oneBlink = (offsetMs: number) => {
        blinkTimersRef.current.push(setTimeout(() => setBlinkScale(0), offsetMs));
        blinkTimersRef.current.push(setTimeout(() => setBlinkScale(0), offsetMs + closeMs)); // hold
        blinkTimersRef.current.push(setTimeout(() => setBlinkScale(1), offsetMs + closeMs + holdMs));
      };

      if (double) {
        // Close/open, then close/open again. Total ~650ms.
        oneBlink(0);
        oneBlink(325);
        blinkTimersRef.current.push(setTimeout(() => {
          blinkInFlightRef.current = false;
        }, 650));
      } else {
        oneBlink(0);
        blinkTimersRef.current.push(setTimeout(() => {
          blinkInFlightRef.current = false;
        }, closeMs + holdMs + openMs));
      }
    };

    let canceled = false;
    const scheduleRegular = () => {
      if (canceled) return;
      const delay = 3000 + Math.random() * 2000; // 3–5s
      const t = setTimeout(() => {
        runBlink(false);
        scheduleRegular();
      }, delay);
      blinkTimersRef.current.push(t);
    };

    const scheduleDouble = () => {
      if (canceled) return;
      const delay = 8000 + Math.random() * 4000; // 8–12s
      const t = setTimeout(() => {
        runBlink(true);
        scheduleDouble();
      }, delay);
      blinkTimersRef.current.push(t);
    };

    scheduleRegular();
    scheduleDouble();

    return () => {
      canceled = true;
      clearBlinkTimers();
      blinkInFlightRef.current = false;
      setBlinkScale(1);
    };
  }, [state]);

  // ── Speech bubble — fires on every state change ──
  useEffect(() => {
    if (state === prevState.current) return;
    prevState.current = state;
    setSpeech(speechText ?? randomLine(state));
    setShowBubble(true);
  }, [state, speechText]);

  // One-shot cheer flash/glow. (Reduced motion disables it.)
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (state !== "cheer") return;
    setCheerPulseKey((k) => k + 1);
  }, [state, prefersReducedMotion]);

  useEffect(() => {
    if (!showSpeech) return;
    if (speechText === undefined) return;
    setSpeech(speechText);
    setShowBubble(true);
  }, [speechText, showSpeech]);

  // ── Show speech on first mount ──
  useEffect(() => {
    if (!showSpeech) return;
    setSpeech(speechText ?? randomLine(state));
    setShowBubble(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── LED cycling ──
  useEffect(() => {
    if (state !== "think") return;
    const id = setInterval(() => setActiveLed(l => (l % 3) + 1), 380);
    return () => clearInterval(id);
  }, [state]);

  // ── Reactive jump on justPassed ──
  useEffect(() => {
    if (!justPassed) return;
    reactiveControls.start({
      y: [0, -28, 0, -14, 0],
      scale: [1, 1.12, 1, 1.05, 1],
      transition: { duration: 0.85, times: [0, 0.28, 0.55, 0.75, 1], ease: "easeOut" },
    });
  }, [justPassed]);

  // ── Reactive shake on justFailed ──
  useEffect(() => {
    if (!justFailed) return;
    reactiveControls.start({
      x: [0, -9, 9, -7, 7, -4, 4, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    });
  }, [justFailed]);

  // ── Arm wave helper ──
  const triggerArmWave = () => {
    setIsWaving(true);
    rightArmWaveControls.start({
      rotate: [0, -60, -20, -60, -20, -60, 0],
      transition: { duration: 0.8, ease: "easeInOut" },
    }).then(() => setIsWaving(false));
  };

  // ── Lesson mount entrance (fires once on mount when lessonMount=true) ──
  useEffect(() => {
    if (!lessonMount) return;
    reactiveControls.set({ y: 60, opacity: 0 });
    reactiveControls.start({
      y: 0, opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    }).then(() => triggerArmWave());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Wave on mount (Onboarding Screen 1) ──
  useEffect(() => {
    if (!waveOnMount) return;
    const timer = setTimeout(() => triggerArmWave(), 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step advance hop ──
  useEffect(() => {
    if (!justAdvanced) return;
    reactiveControls.start({
      y: [0, -8, 0],
      transition: { duration: 0.35, ease: "easeOut" },
    });
  }, [justAdvanced]);

  // ── Pupil tracking (mouse → lerp → RAF) ──
  useEffect(() => {
    if (state === "sad") return;
    const handleMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const MAX = 3;
      targetPupilRef.current = {
        x: Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2))) * MAX,
        y: Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2))) * MAX,
      };
      lastPointerMoveAtRef.current = Date.now();
    };
    const loop = () => {
      setPupilOff(prev => {
        const f = 0.08;
        const nx = prev.x + (targetPupilRef.current.x - prev.x) * f;
        const ny = prev.y + (targetPupilRef.current.y - prev.y) * f;
        if (Math.abs(nx - prev.x) < 0.005 && Math.abs(ny - prev.y) < 0.005) return prev;
        return { x: nx, y: ny };
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", handleMove);
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [state]);

  // ── Random idle glances ──
  useEffect(() => {
    if (state !== "idle") return;
    let canceled = false;
    let timer: number | undefined;

    const schedule = () => {
      if (canceled) return;
      const delay = 8000 + Math.random() * 7000; // 8–15s
      timer = window.setTimeout(async () => {
        if (canceled) return;
        // Don't glance mid-blink, and don't fight recent pointer tracking.
        const now = Date.now();
        if (blinkInFlightRef.current || now - lastPointerMoveAtRef.current < 2500) {
          schedule();
          return;
        }

        const dx = Math.random() * 8 - 4; // ±4px
        const dy = Math.random() * 4 - 2; // ±2px
        try {
          await glanceControls.start({ x: dx, y: dy, transition: { duration: 0.4, ease: "easeInOut" } });
          await new Promise((r) => setTimeout(r, 1000));
          await glanceControls.start({ x: 0, y: 0, transition: { duration: 0.4, ease: "easeInOut" } });
        } finally {
          schedule();
        }
      }, delay);
    };

    schedule();
    return () => {
      canceled = true;
      if (timer) window.clearTimeout(timer);
      glanceControls.stop();
      glanceControls.set({ x: 0, y: 0 });
    };
  }, [state, glanceControls]);

  // ── Think lightbulb ──
  useEffect(() => {
    if (state !== "think") { setShowLightbulb(false); return; }
    setShowLightbulb(true);
    const t = setTimeout(() => setShowLightbulb(false), 2500);
    return () => clearTimeout(t);
  }, [state]);

  const eyeScale = {
    left: EYE_SCALE[state].left * blinkScale,
    right: EYE_SCALE[state].right * blinkScale,
  };
  const bc = bubbleColour(state);

  const speechAdvance = useCallback(() => {
    if (!onSpeechContinue) return;
    setShowBubble(false);
    onSpeechContinue();
    if (state === "sad" && onStateEnd) setTimeout(onStateEnd, 400);
  }, [onSpeechContinue, state, onStateEnd]);

  const speechGate = useTapGate(
    speechAdvance,
    speech,
    !!(showSpeech && showBubble && onSpeechContinue)
  );

  return (
    <div
      ref={containerRef}
      className={`byte-mascot ${className}`}
      style={{ position: "relative", width: size, userSelect: "none", flexShrink: 0 }}
    >
      {/* ── Think lightbulb ── */}
      <AnimatePresence>
        {showLightbulb && (
          <motion.div
            key="lightbulb"
            style={{
              position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
              fontSize: size * 0.22, pointerEvents: "none", zIndex: 25, userSelect: "none",
            }}
            initial={{ scale: 0, y: -10, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1.0], y: [-10, -20, -20], opacity: [0, 1, 1] }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, times: [0, 0.4, 1] }}
          >
            💡
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Speech Bubble ── */}
      <AnimatePresence>
        {showSpeech && showBubble && (
          <motion.div
            key={speech}
            {...(onSpeechContinue ? speechGate.containerProps : {})}
            aria-live="polite"
            aria-atomic="true"
            initial={{ opacity: 0, y: 8, scale: 0.90 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: 10,
              background: bc.bg,
              border: `2px solid ${bc.border}`,
              borderRadius: 14,
              padding: onSpeechContinue && speechGate.indicatorVisible ? "8px 14px 28px 14px" : "8px 14px",
              fontSize: 13,
              fontWeight: 700,
              color: bc.text,
              whiteSpace: "pre-wrap",
              maxWidth: 280,
              zIndex: 20,
              boxShadow: `0 4px 18px ${bc.border}33`,
              fontFamily: "system-ui, -apple-system, sans-serif",
              pointerEvents: "auto",
              minWidth: 60,
              cursor: onSpeechContinue ? "pointer" : "default",
            }}
          >
            {onSpeechContinue && (
              <span className="sr-only" aria-live="polite" aria-atomic="true">
                {speechGate.announce}
              </span>
            )}
            {speech}
            {onSpeechContinue && speechGate.indicatorVisible && (
              <TapToContinueHint accentColor={bc.border} />
            )}
            {/* Tail */}
            <div style={{
              position: "absolute", bottom: -9, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
              borderTop: `9px solid ${bc.border}`,
            }} />
            <div style={{
              position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "7px solid transparent", borderRight: "7px solid transparent",
              borderTop: `8px solid ${bc.bg}`,
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reactive wrapper (shake / jump) ── */}
      <motion.div
        animate={
          prefersReducedMotion || state !== "idle"
            ? {}
            : { scaleY: [1.0, 1.02, 1.0], scaleX: [1.0, 0.99, 1.0] }
        }
        transition={prefersReducedMotion || state !== "idle" ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ display: "inline-block", position: "relative" }}
      >
        {/* Face glow on cheer (one-shot) */}
        <AnimatePresence>
          {!prefersReducedMotion && state === "cheer" && (
            <motion.div
              key={`face-glow-${cheerPulseKey}`}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                position: "absolute",
                left: "50%",
                top: "8%",
                transform: "translateX(-50%)",
                width: size * 0.9,
                height: size * 0.75,
                background: "radial-gradient(circle, rgba(255,215,0,0.30), transparent 65%)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          )}
        </AnimatePresence>

        <motion.div animate={reactiveControls} style={{ display: "inline-block", position: "relative" }}>
        {/* ── Star burst particles on correct answer ── */}
        <BurstParticles size={size} show={justPassed} />
        {/* ── SVG Robot ── */}
        <motion.svg
          key={`byte-svg-${state}`}
          viewBox="0 0 180 220"
          width={size}
          height={size * (220 / 180)}
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`Byte is ${state}`}
          role="img"
          animate={
            !prefersReducedMotion && state === "cheer"
              ? { filter: ["brightness(1)", "brightness(1.4)", "brightness(1)"] }
              : { filter: "brightness(1)" }
          }
          transition={!prefersReducedMotion && state === "cheer" ? { duration: 0.3, ease: "easeOut" } : {}}
          style={{ overflow: "visible", display: "block" }}
        >
          {/* ── Continuous per-state float loop ── */}
          <motion.g animate={floatAnimate(state, isCheer)}>
            <motion.g
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              animate={{ rotate: storyLean(state) }}
              transition={{ duration: state === "story" ? 1.0 : 0.8, ease: "easeOut" }}
            >

            {/* ── Antenna ── */}
            <motion.g
              style={{ transformOrigin: "90px 12px" }}
              animate={prefersReducedMotion ? {} : { rotate: [0, 3, -3, 0] }}
              transition={prefersReducedMotion ? {} : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <line x1="90" y1="18" x2="90" y2="38" stroke="#16a34a" strokeWidth="4" strokeLinecap="round"/>
              <motion.circle
                cx="90" cy="12"
                r={9}
                animate={{
                  scale: [1, 1.28, 1],
                  fill: isCheer ? ["#facc15", "#fde047", "#facc15"] : ["#22c55e", "#4ade80", "#22c55e"],
                }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                stroke="#16a34a" strokeWidth="2"
              />
              <circle cx="90" cy="12" r="4" fill="#bbf7d0" opacity={0.8}/>
            </motion.g>

            {/* ── Head ── */}
            <motion.g
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              variants={headVariants}
              animate={state}
            >
              <rect x="30" y="38" width="120" height="90" rx="22" fill="#22c55e" stroke="#16a34a" strokeWidth="3"/>

              {/* Eye sockets */}
              <rect x="46" y="58" width="34" height="26" rx="8" fill="#16a34a" opacity={0.35}/>
              <rect x="100" y="58" width="34" height="26" rx="8" fill="#16a34a" opacity={0.35}/>

              {/* Left eye */}
              <motion.g
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                animate={{ scaleY: eyeScale.left }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <motion.g animate={glanceControls}>
                {/* Socket shadow (depth) */}
                <ellipse cx="63" cy="71" rx="12" ry="9" fill="#2d6e30" opacity={0.85}/>
                <circle cx="63" cy="71" r="10" fill="white"/>
                {/* Eyelid shadow for cheer/celebrate (darker than face for readable expression) */}
                <motion.ellipse
                  cx="63" cy="66" rx="11" ry="6"
                  fill="#3a8040"
                  animate={{ opacity: isCheer ? 0.55 : 0 }}
                  transition={{ duration: 0.2 }}
                />
                <circle cx={65 + pupilOff.x} cy={72 + pupilOff.y} r="5" fill="#1A1A2E"/>
                <circle cx={67 + pupilOff.x * 0.6} cy={69 + pupilOff.y * 0.6} r="3" fill="white" opacity={0.95}/>
                </motion.g>
              </motion.g>

              {/* Right eye */}
              <motion.g
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                animate={{ scaleY: eyeScale.right }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <motion.g animate={glanceControls}>
                {/* Socket shadow (depth) */}
                <ellipse cx="117" cy="68" rx="12" ry="9" fill="#2d6e30" opacity={0.85}/>
                <circle cx="117" cy="68" r="10" fill="white"/>
                {/* Eyelid shadow for cheer/celebrate (darker than face for readable expression) */}
                <motion.ellipse
                  cx="117" cy="63" rx="11" ry="6"
                  fill="#3a8040"
                  animate={{ opacity: isCheer ? 0.55 : 0 }}
                  transition={{ duration: 0.2 }}
                />
                <circle cx={119 + pupilOff.x} cy={69 + pupilOff.y} r="5" fill="#1A1A2E"/>
                <circle cx={121 + pupilOff.x * 0.6} cy={66 + pupilOff.y * 0.6} r="3" fill="white" opacity={0.95}/>
                </motion.g>
              </motion.g>

              {/* Mouth */}
              <motion.path
                initial={{ d: MOUTH.idle }}
                animate={{ d: MOUTH[state] }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                fill="none" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round"
              />

              {/* Cheek blush */}
              <motion.ellipse cx="44"  cy="95" rx="10" ry="6" fill="#bbf7d0"
                animate={{ opacity: isCheer ? 0.7 : 0 }} transition={{ duration: 0.3 }} />
              <motion.ellipse cx="136" cy="95" rx="10" ry="6" fill="#bbf7d0"
                animate={{ opacity: isCheer ? 0.7 : 0 }} transition={{ duration: 0.3 }} />
            </motion.g>

            {/* ── Body ── */}
            <motion.g
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              variants={bodyVariants}
              animate={state}
            >
              <rect x="35" y="132" width="110" height="72" rx="18" fill="#16a34a" stroke="#15803d" strokeWidth="3"/>
              <rect x="52" y="146" width="76" height="44" rx="10" fill="#22c55e" stroke="#15803d" strokeWidth="1.5"/>

              {/* LEDs */}
              <motion.circle cx="70"  cy="162" r="6"
                animate={{ fill: activeLed === 1 || isCheer ? "#facc15" : "#bbf7d0", scale: activeLed === 1 ? 1.2 : 1 }}
                transition={{ duration: 0.15 }} />
              <motion.circle cx="90"  cy="162" r="6"
                animate={{ fill: activeLed === 2 || isCheer ? "#4ade80" : "#bbf7d0", scale: activeLed === 2 ? 1.2 : 1 }}
                transition={{ duration: 0.15 }} />
              <motion.circle cx="110" cy="162" r="6"
                animate={{ fill: activeLed === 3 || isCheer ? "#facc15" : "#bbf7d0", scale: activeLed === 3 ? 1.2 : 1 }}
                transition={{ duration: 0.15 }} />

              {/* Progress bar */}
              <rect x="62" y="175" width="56" height="7" rx="3.5" fill="#15803d"/>
              <motion.rect
                x="62" y="175" height="7" rx="3.5"
                initial={{ width: 30, fill: "#bbf7d0" }}
                animate={{
                  width: isCheer ? 56 : state === "think" ? 36 : state === "sad" ? 14 : 30,
                  fill: isCheer ? "#facc15" : "#bbf7d0",
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </motion.g>

            {/* ── Left Arm (idle sway wrapper + state variants) ── */}
            <motion.g
              style={{ transformBox: "fill-box", transformOrigin: "50% 30%" }}
              animate={state === "idle" ? { rotate: [-2, 2, -2] } : { rotate: 0 }}
              transition={state === "idle"
                ? { duration: 4.2, repeat: Infinity, ease: "easeInOut" as const, repeatType: "loop" as const }
                : { duration: 0.5 }}
            >
              <motion.g
                style={{ transformBox: "fill-box", transformOrigin: "50% 30%" }}
                variants={leftArmVariants}
                animate={state}
              >
                <rect x="10" y="136" width="26" height="52" rx="13" fill="#22c55e" stroke="#16a34a" strokeWidth="3"/>
                <circle cx="23" cy="195" r="10" fill="#16a34a" stroke="#15803d" strokeWidth="2"/>
              </motion.g>
            </motion.g>

            {/* ── Right Arm (idle sway wrapper + wave/state variants) ── */}
            <motion.g
              style={{ transformBox: "fill-box", transformOrigin: "50% 30%" }}
              animate={(state === "idle" && !isWaving) ? { rotate: [2, -2, 2] } : { rotate: 0 }}
              transition={(state === "idle" && !isWaving)
                ? { duration: 3.8, repeat: Infinity, ease: "easeInOut" as const, repeatType: "loop" as const }
                : { duration: 0.5 }}
            >
              <motion.g
                style={{ transformBox: "fill-box", transformOrigin: "50% 30%" }}
                variants={isWaving ? undefined : rightArmVariants}
                animate={isWaving ? rightArmWaveControls : state}
              >
                <rect x="144" y="136" width="26" height="52" rx="13" fill="#22c55e" stroke="#16a34a" strokeWidth="3"/>
                <circle cx="157" cy="195" r="10" fill="#16a34a" stroke="#15803d" strokeWidth="2"/>
              </motion.g>
            </motion.g>

            {/* ── Legs ── */}
            <g>
              <rect x="55" y="200" width="28" height="18" rx="6" fill="#15803d"/>
              <rect x="50" y="212" width="36" height="8" rx="4" fill="#16a34a" stroke="#15803d" strokeWidth="1.5"/>
              <rect x="97" y="200" width="28" height="18" rx="6" fill="#15803d"/>
              <rect x="94" y="212" width="36" height="8" rx="4" fill="#16a34a" stroke="#15803d" strokeWidth="1.5"/>
            </g>

            {/* ── Sparkles (cheer/celebrate only) ── */}
            <AnimatePresence>
              {isCheer && (
                <motion.g key="sparkles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Sparkle x={38}  y={52}  delay={0}    size={16}/>
                  <Sparkle x={140} y={44}  delay={0.18} size={20}/>
                  <Sparkle x={158} y={82}  delay={0.32} size={13}/>
                  <Sparkle x={20}  y={88}  delay={0.12} size={13}/>
                  <Sparkle x={88}  y={22}  delay={0.25} size={12}/>
                  {state === "celebrate" && <>
                    <Sparkle x={6}   y={130} delay={0.08} size={15}/>
                    <Sparkle x={166} y={118} delay={0.38} size={18}/>
                    <Sparkle x={92}  y={8}   delay={0.44} size={14}/>
                  </>}
                </motion.g>
              )}
            </AnimatePresence>
          </motion.g>
            </motion.g>
        </motion.svg>
        </motion.div>
      </motion.div>
    </div>
  );
});

Byte.displayName = "Byte";
export default Byte;
