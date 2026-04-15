import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';
import { lesson01 } from '../data/lessons/lesson-01';
import { lesson02 } from '../data/lessons/lesson-02';
import { lesson03 } from '../data/lessons/lesson-03';
import { lesson04 } from '../data/lessons/lesson-04';
import { lesson05 } from '../data/lessons/lesson-05';
import { lesson06 } from '../data/lessons/lesson-06';
import { play } from '../utils/sounds';
import Byte from '../components/Byte';
import FlowBackButton from '../components/FlowBackButton';
import { speak, stopSpeaking } from '../utils/voice';

const lessons = {
  '1': lesson01,
  '2': lesson02,
  '3': lesson03,
  '4': lesson04,
  '5': lesson05,
  '6': lesson06,
};

export default function CompletePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lesson = lessons[id as keyof typeof lessons];
  
  const { 
    topicName, 
    xp,
    gainXP, 
    markLessonComplete, 
    checkAndUpdateStreak,
    heartsLostThisLesson,
    completedLessons,
    clearMistakeLog
  } = useGameStore();

  if (!lesson || !topicName) return <Navigate to="/map" replace />;

  const resolve = (field: string | ((t: string) => string) | undefined): string => {
    if (!field) return '';
    if (typeof field === 'function') return field(topicName);
    return field.replace(/\{topic\}/g, topicName);
  };

  useEffect(() => {
    speak(resolve(lesson.celebrationQuote));
    return () => stopSpeaking();
  }, [lesson.id]);

  // Visible confetti bursts on mount (rendered above all content).
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#5C3EBC', '#D4581A', '#FFD700', '#ffffff', '#1A7A4E'],
      zIndex: 9999,
    });

    const t2 = window.setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 90,
        angle: 60,
        origin: { x: 0.1, y: 0.5 },
        colors: ['#5C3EBC', '#D4581A', '#FFD700', '#ffffff'],
        zIndex: 9999,
      });
    }, 1200);

    const t3 = window.setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 90,
        angle: 120,
        origin: { x: 0.9, y: 0.5 },
        colors: ['#5C3EBC', '#D4581A', '#FFD700', '#ffffff'],
        zIndex: 9999,
      });
    }, 2000);

    const t4 = window.setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { x: 0.5, y: 0.3 },
        colors: ['#FFD700', '#ffffff', '#5C3EBC'],
        zIndex: 9999,
        scalar: 1.2,
      });
    }, 3500);

    return () => {
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, []);

  const didRunRef = useRef(false);
  const startXPRef = useRef(xp);
  const [displayXP, setDisplayXP] = useState(xp);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared' | 'error'>( 'idle');
  const statusTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (didRunRef.current) return;
    if (completedLessons.includes(lesson.id)) return;
    didRunRef.current = true;

    play('complete');
    
    // Rewards
    setTimeout(() => {
      gainXP(lesson.xpReward);
      play('xpPop');
    }, 1000);

    markLessonComplete(lesson.id);
    checkAndUpdateStreak();
    clearMistakeLog(lesson.id);
  }, [lesson.id, completedLessons, gainXP, markLessonComplete, checkAndUpdateStreak, clearMistakeLog]);

  const isPerfect = heartsLostThisLesson === 0;
  const celebrationQuote = resolve(lesson.celebrationQuote);

  // XP count-up: animate displayXP from previous to current xp.
  useEffect(() => {
    const target = xp;
    const start = displayXP;
    if (target === start) return;

    const duration = 1500;
    const startTime = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayXP(Math.round(start + (target - start) * eased));
      if (progress >= 1) window.clearInterval(interval);
    }, 16);

    return () => window.clearInterval(interval);
  }, [xp]);

  // Capture "pre-complete" XP once on mount for correctness if we re-render.
  useEffect(() => {
    startXPRef.current = displayXP;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current !== null) window.clearTimeout(statusTimerRef.current);
    };
  }, []);

  const shareLink = async () => {
    const url = window.location.href;
    const title = `Lesson ${lesson.lessonNumber} complete!`;
    const text = `I just completed Lesson ${lesson.lessonNumber} on Code4Kidz!`;

    // Prefer native share sheets when available (mobile/tablet).
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        setShareStatus('shared');
        if (statusTimerRef.current !== null) window.clearTimeout(statusTimerRef.current);
        statusTimerRef.current = window.setTimeout(() => setShareStatus('idle'), 1400);
        return;
      } catch {
        // If user cancels, fall through to clipboard (no toast spam).
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('copied');
      if (statusTimerRef.current !== null) window.clearTimeout(statusTimerRef.current);
      statusTimerRef.current = window.setTimeout(() => setShareStatus('idle'), 1400);
    } catch {
      setShareStatus('error');
      if (statusTimerRef.current !== null) window.clearTimeout(statusTimerRef.current);
      statusTimerRef.current = window.setTimeout(() => setShareStatus('idle'), 1800);
    }
  };

  return (
    <div className="complete-bg-animated min-h-dvh w-full relative flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      {/* Top-left: Map */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 30 }}>
        <FlowBackButton to="/map" label="← Map" replace />
      </div>

      {/* Top-right: PERFECT */}
      {isPerfect && (
        <motion.div
          style={{ position: 'fixed', top: 20, right: 20, zIndex: 100 }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.8 }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            borderRadius: '50%',
            width: 80, height: 80,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(255,215,0,0.6)',
            border: '3px solid rgba(255,255,255,0.4)',
          }}>
            <span style={{ fontSize: 24 }}>⭐</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: 'white', letterSpacing: '0.05em' }}>
              PERFECT
            </span>
          </div>
        </motion.div>
      )}

      {/* Top-right: XP (below PERFECT) */}
      <div style={{ position: 'absolute', top: 24, right: isPerfect ? 116 : 20, zIndex: 30 }}>
        <div style={{
          background: 'rgba(0,0,0,0.22)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.16)',
          borderRadius: 999,
          padding: '10px 14px',
          color: 'white',
          fontWeight: 900,
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>⭐</span>
          <span style={{ fontSize: 14 }}>{displayXP} XP</span>
        </div>
      </div>

      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: [0, 1.3, 1.0], rotate: [0, -8, 8, -4, 4, 0] }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        style={{ marginBottom: 16, zIndex: 10 }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: 80, lineHeight: 1 }}
        >
          🏆
        </motion.div>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          fontSize: 'clamp(28px, 6vw, 48px)',
          fontWeight: 900,
          color: 'white',
          textAlign: 'center',
          letterSpacing: '-0.01em',
          marginBottom: 8,
          textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          zIndex: 10,
        }}
      >
        LESSON {lesson.lessonNumber} COMPLETE!
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 40,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        {lesson.title}
      </motion.p>

      {/* Byte + quote row (no bubble) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          maxWidth: 560,
          width: '100%',
          marginBottom: 40,
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          borderRadius: 20,
          padding: '20px 24px',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 10,
        }}
      >
        <Byte mood="cheer" size={80} justPassed showSpeech={false} />
        <p style={{
          color: 'white',
          fontSize: 16,
          lineHeight: 1.65,
          fontStyle: 'italic',
          margin: 0,
          paddingTop: 8,
        }}>
          {celebrationQuote}
        </p>
      </motion.div>

      {/* Continue */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        onClick={() => navigate('/map')}
        style={{
          background: 'linear-gradient(135deg, #D4581A, #f07030)',
          color: 'white',
          fontSize: 20,
          fontWeight: 900,
          padding: '18px 64px',
          borderRadius: 16,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(212,88,26,0.5)',
          letterSpacing: '0.02em',
          marginBottom: 20,
          zIndex: 10,
        }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span
          style={{ display: 'inline-block' }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          CONTINUE →
        </motion.span>
      </motion.button>

      {/* Share link */}
      <button
        onClick={() => { void shareLink(); }}
        style={{
          background: 'none',
          border: 'none',
          color: shareStatus === 'error' ? 'rgba(255,220,220,0.95)' : (shareStatus !== 'idle' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.55)'),
          fontSize: 14,
          cursor: 'pointer',
          textDecoration: 'underline',
          zIndex: 10,
          fontWeight: 700,
        }}
        aria-live="polite"
      >
        {shareStatus === 'shared'
          ? 'Shared!'
          : shareStatus === 'copied'
            ? 'Link copied!'
            : shareStatus === 'error'
              ? 'Could not copy — try again'
              : 'Share achievement'}
      </button>
    </div>
  );
}