import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import ByteTypewriter from '../components/ByteTypewriter';
import XPCounter from '../components/XPCounter';
import StreakBadge from '../components/StreakBadge';
import { speak, stopSpeaking } from '../utils/voice';

interface LessonNode {
  id: string;
  num: number;
  title: string;
  emoji: string;
  teaser?: string;
  comingSoonTopic?: string;
  comingSoon?: boolean;
}

const LESSON_NODES: LessonNode[] = [
  { id: 'lesson-01', num: 1, title: 'Say Hello to the Web!', emoji: '👋' },
  { id: 'lesson-02', num: 2, title: 'Make a Big Title!',     emoji: '🔤' },
  { id: 'lesson-03', num: 3, title: 'Write Your Story',      emoji: '📝' },
  { id: 'lesson-04', num: 4, title: 'Paint With Colors!',    emoji: '🎨' },
  { id: 'lesson-05', num: 5, title: 'Make a List',           emoji: '📋' },
  { id: 'lesson-06', num: 6, title: 'Add a Picture!',        emoji: '🖼️' },
  { id: 'lesson-07', num: 7, title: 'Build a Button!',       emoji: '🔒', comingSoon: true, teaser: 'Make it clickable + stylish.', comingSoonTopic: 'Buttons & interactions' },
  { id: 'lesson-08', num: 8, title: 'Layout Like a Pro',      emoji: '🔒', comingSoon: true, teaser: 'Flexbox makes magic rows.', comingSoonTopic: 'Flexbox & layout' },
  { id: 'lesson-09', num: 9, title: 'Animate Your Page',      emoji: '🔒', comingSoon: true, teaser: 'Tiny motion that feels alive.', comingSoonTopic: 'CSS animations' },
  { id: 'lesson-10', num: 10, title: 'Make a Mini Game!',     emoji: '🔒', comingSoon: true, teaser: 'Score points with JS.', comingSoonTopic: 'JavaScript games' },
];

// Winding offsets: left, center, right, center, left...
const X_OFFSETS = [-80, 0, 80, 0, -80, 0, 80, 0, -80, 0];

/** Top inset for skill tree + vertical spine (keeps timeline aligned with connector segments). */
const SKILL_TREE_TOP_OFFSET_PX = 55;

export default function MapPage() {
  const { topicName, completedLessons, xp, streak, playedDates } = useGameStore();
  const [hoveredLocked, setHoveredLocked] = useState<number | null>(null);
  const [tappedLocked, setTappedLocked] = useState<number | null>(null);
  const [showByteBubble, setShowByteBubble] = useState(true);
  const currentRef = useRef<HTMLDivElement | null>(null);

  if (!topicName) return <Navigate to="/onboarding" replace />;

  // FIX 2: background must work offline on any hardware (CSS-only).
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const generateStars = (count: number) => {
    return Array.from({ length: count }, () => {
      // Edge-weighted placement
      const zone = Math.random();
      let x: number;
      let y: number;

      if (zone < 0.75) {
        // 75% EDGE ZONE (left 20%, right 20%, top 15%, bottom 15%)
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) {
          x = Math.random() * 20;
          y = Math.random() * 100;
        } else if (edge === 1) {
          x = 80 + Math.random() * 20;
          y = Math.random() * 100;
        } else if (edge === 2) {
          x = Math.random() * 100;
          y = Math.random() * 15;
        } else {
          x = Math.random() * 100;
          y = 85 + Math.random() * 15;
        }
      } else {
        // 25% CENTER ZONE (sparse, dim)
        x = 20 + Math.random() * 60;
        y = 15 + Math.random() * 70;
      }

      const isEdge = zone < 0.75;
      const size = isEdge
        ? (Math.random() < 0.15 ? 3 : Math.random() < 0.4 ? 2.5 : 2)
        : (Math.random() < 0.05 ? 2 : 1.5);

      const baseOpacity = isEdge
        ? (size === 3 ? 0.95 : size === 2.5 ? 0.75 : 0.5)
        : 0.15;

      const colorRoll = Math.random();
      const color = colorRoll < 0.08
        ? 'rgba(255,220,100,1)'
        : colorRoll < 0.25
          ? 'rgba(180,160,255,1)'
          : 'rgba(255,255,255,1)';

      const duration = isEdge
        ? 2 + Math.random() * 5
        : 5 + Math.random() * 8;

      const delay = Math.random() * 8;

      const animClass = baseOpacity > 0.7
        ? 'starTwinkleBright'
        : baseOpacity > 0.4
          ? 'starTwinkleMid'
          : 'starTwinkleDim';

      return { x, y, size, baseOpacity, color, duration, delay, animClass };
    });
  };

  // Generate once (not on every render)
  const [stars] = useState(() => generateStars(120));

  const HERO_STARS = useMemo(
    () => ([
      { x: 4,  y: 8,  size: 4,   opacity: 1,    color: 'rgba(255,255,255,1)', duration: 3.2, delay: 0 },
      { x: 8,  y: 4,  size: 2.5, opacity: 0.8,  color: 'rgba(200,180,255,1)', duration: 4.1, delay: 1.2 },
      { x: 2,  y: 18, size: 2,   opacity: 0.6,  color: 'rgba(255,255,255,1)', duration: 5.0, delay: 0.5 },
      { x: 92, y: 6,  size: 3.5, opacity: 1,    color: 'rgba(255,240,180,1)', duration: 2.8, delay: 2.0 }, // warm
      { x: 96, y: 14, size: 2,   opacity: 0.7,  color: 'rgba(255,255,255,1)', duration: 4.5, delay: 0.8 },
      { x: 6,  y: 88, size: 3,   opacity: 0.9,  color: 'rgba(180,220,255,1)', duration: 3.8, delay: 1.5 },
      { x: 12, y: 94, size: 2,   opacity: 0.6,  color: 'rgba(255,255,255,1)', duration: 5.2, delay: 3.0 },
      { x: 88, y: 90, size: 4,   opacity: 1,    color: 'rgba(255,255,255,1)', duration: 2.5, delay: 0.3 },
      { x: 94, y: 82, size: 2.5, opacity: 0.8,  color: 'rgba(200,180,255,1)', duration: 3.9, delay: 1.8 },
      { x: 3,  y: 45, size: 3,   opacity: 0.85, color: 'rgba(255,255,255,1)', duration: 4.0, delay: 2.5 },
      { x: 97, y: 52, size: 2.5, opacity: 0.75, color: 'rgba(180,160,255,1)', duration: 3.5, delay: 1.0 },
    ]),
    []
  );

  const [shootingStar, setShootingStar] = useState<null | { x: number; y: number; id: number }>(null);
  useEffect(() => {
    const fireShootingStar = () => {
      const startX = Math.random() < 0.5
        ? Math.random() * 40
        : Math.random() * 15;
      const startY = startX > 15 ? 0 : Math.random() * 60;

      const id = Date.now();
      setShootingStar({ x: startX, y: startY, id });
      window.setTimeout(() => setShootingStar(null), 1200);
    };

    const interval = window.setInterval(
      fireShootingStar,
      12000 + Math.random() * 6000
    );
    return () => window.clearInterval(interval);
  }, []);

  const CSSStarField = () => (
    <>
      {/* Nebula orbs (behind stars) */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: -100,
          right: -80,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(92,62,188,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: -1,
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
          transition: 'transform 0.8s ease-out',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: -120,
          left: -100,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,124,123,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: -1,
          transform: `translate(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px)`,
          transition: 'transform 0.8s ease-out',
        }}
      />

      {/* Stars */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
          transition: 'transform 0.8s ease-out',
        }}
      >
        {stars.map((star, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              background: star.color,
              opacity: star.baseOpacity,
              animationName: star.animClass,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              pointerEvents: 'none',
            }}
          />
        ))}

        {HERO_STARS.map((s, i) => (
          <div
            key={`hero-${i}`}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: s.color,
              opacity: s.opacity,
              animationName: 'starTwinkleBright',
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              pointerEvents: 'none',
            }}
          />
        ))}

        {shootingStar && (
          <div
            key={shootingStar.id}
            style={{
              position: 'fixed',
              left: `${shootingStar.x}%`,
              top: `${shootingStar.y}%`,
              width: 80,
              height: 2,
              borderRadius: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
              animation: 'shootingStar 1.2s ease-out forwards',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}
      </div>
    </>
  );

  const isAccessible = (node: LessonNode): boolean => {
    if (node.comingSoon) return false;
    if (node.num === 1) return true;
    const prevId = `lesson-0${String(node.num - 1).padStart(1, '0')}`;
    return completedLessons.includes(prevId);
  };

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [completedLessons.length]);

  const last7 = (() => {
    const now = new Date();
    const days: Array<{ iso: string; label: string }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      days.push({ iso, label });
    }
    return days;
  })();
  const playedSet = new Set(playedDates);
  const todayISO = new Date().toISOString().slice(0, 10);

  const contextMessage =
    completedLessons.length === 0
      ? 'Tap the glowing node to start your first lesson.'
      : completedLessons.length >= 6
        ? 'Look at you! You finished Level 1. Level 2 is coming soon.'
        : 'Nice work! Tap the next glowing node to keep going.';

  useEffect(() => {
    speak(contextMessage);
    return () => stopSpeaking();
  }, [contextMessage]);

  useEffect(() => {
    const t = window.setTimeout(() => setShowByteBubble(false), 6000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-dvh flex flex-col items-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0f0f1a 0%, #1a0a3d 40%, #0d2040 100%)' }}
    >
      <CSSStarField />

      <div
        className="relative z-1 flex w-full min-h-dvh flex-col items-center"
        onClick={() => setShowByteBubble(false)}
        role="presentation"
      >
      {/* Orbs (kept extremely subtle; must never obscure labels) */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{ width: 160, height: 160, background: '#D4581A', filter: 'blur(50px)', opacity: 0.06, bottom: 160, right: -40 }}
      />

      {/* ── Header ── */}
      <header
        className="w-full px-5 py-3 flex items-center justify-between sticky top-0 z-20"
        style={{
          background: 'rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span className="font-black text-lg" style={{ color: 'white' }}>
          <span style={{ color: '#9B72F0' }}>Code</span>4Kidz
        </span>

        <div className="flex items-center gap-2">
          {/* Streak badge */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(212,88,26,0.2)', border: '1px solid rgba(212,88,26,0.4)' }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ color: '#ff9f60', fontSize: 14, fontWeight: 800 }}>{streak}</span>
          </div>
          {/* XP badge */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(92,62,188,0.2)', border: '1px solid rgba(92,62,188,0.4)' }}>
            <span style={{ fontSize: 14 }}>⭐</span>
            <span style={{ color: '#c4a8ff', fontSize: 14, fontWeight: 800 }}>{xp} XP</span>
          </div>
          {/* Original components (hidden but kept for store reactivity) */}
          <span className="hidden"><StreakBadge /><XPCounter /></span>
        </div>
      </header>

      {/* ── Title ── */}
      <p className="text-white font-black text-base pt-5 pb-1" style={{ textAlign: 'center' }}>
        Your Coding Journey
      </p>
      <p className="text-xs pb-5" style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
        {topicName} skill tree
      </p>

      {/* ── Streak Calendar (last 7 days) ── */}
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', padding: '0 20px 14px', position: 'relative', zIndex: 20, background: 'transparent' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
          {last7.map((d) => {
            const isToday = d.iso === todayISO;
            const didPlay = playedSet.has(d.iso);
            const bg = didPlay ? (isToday ? '#1A7A4E' : '#5C3EBC') : 'rgba(255,255,255,0.1)';
            const border = isToday && !didPlay ? '2px solid rgba(212,88,26,0.9)' : '2px solid rgba(255,255,255,0.12)';
            return (
              <motion.div
                key={d.iso}
                animate={isToday && !didPlay ? { boxShadow: ['0 0 0 0 rgba(212,88,26,0)', '0 0 0 8px rgba(212,88,26,0.25)', '0 0 0 0 rgba(212,88,26,0)'] } : {}}
                transition={isToday && !didPlay ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : {}}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: bg,
                  border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: 14,
                }}
              >
                {didPlay ? '✓' : ''}
              </motion.div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          {last7.map((d) => (
            <div key={`${d.iso}-lbl`} style={{ width: 28, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>
              {d.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Skill Tree ── */}
      <main
        className="flex-1 w-full pb-32 flex flex-col items-center relative"
        style={{
          maxWidth: 480,
          margin: '0 auto',
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: SKILL_TREE_TOP_OFFSET_PX,
        }}
      >
        {/* Vertical guide: starts at first lesson row (not above it in padding), runs to bottom */}
        <div
          className="absolute bottom-0 pointer-events-none"
          style={{
            left: '50%',
            width: 2,
            top: SKILL_TREE_TOP_OFFSET_PX,
            background: 'rgba(255,255,255,0.07)',
            transform: 'translateX(-50%)',
          }}
        />

        {LESSON_NODES.map((node, i) => {
          const isCompleted = completedLessons.includes(node.id);
          const accessible = isAccessible(node);
          const isCurrent = accessible && !isCompleted;
          const isLocked = !accessible;
          const xOffset = X_OFFSETS[i] ?? 0;
          const showLockedTip = hoveredLocked === node.num || tappedLocked === node.num;

          return (
            <div key={node.id} className="flex flex-col items-center w-full">
              {/* Connector line from previous node */}
              {i > 0 && (
                <div style={{ height: 52, display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <div className="map-connector-flow" />
                </div>
              )}

              {/* Node + label */}
              <div
                className="flex flex-col items-center relative"
                style={{ transform: `translateX(${xOffset}px)` }}
              >
                {/* ── Completed ── */}
                {isCompleted && (
                  <Link to={`/lesson/${node.num}`} className="block relative" title={node.title}>
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      style={{
                        width: 56, height: 56,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
                        border: '3px solid #5DCAA5',
                        boxShadow: '0 4px 18px rgba(29,158,117,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <span style={{ position: 'relative', zIndex: 3, fontSize: 24 }}>{node.emoji}</span>
                    </motion.div>
                  </Link>
                )}

                {/* ── Current (glowing) ── */}
                {isCurrent && (
                  <div className="relative" ref={currentRef}>
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow: [
                          '0 0 0 4px rgba(92,62,188,0.3), 0 4px 20px rgba(92,62,188,0.5)',
                          '0 0 0 14px rgba(92,62,188,0.12), 0 4px 24px rgba(92,62,188,0.6)',
                          '0 0 0 4px rgba(92,62,188,0.3), 0 4px 20px rgba(92,62,188,0.5)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ borderRadius: '50%' }}
                    />
                    {/* START badge */}
                    <motion.div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-black px-3 py-1 rounded-full pointer-events-none z-10"
                      style={{ background: '#9B72F0', color: 'white', fontSize: 11 }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      TAP!
                    </motion.div>
                    <Link to={`/lesson/${node.num}`}>
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        style={{
                          width: 56, height: 56,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7F77DD, #5C3EBC)',
                          border: '3px solid #9B72F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        <motion.span
                          style={{ position: 'relative', zIndex: 3, fontSize: 24, display: 'inline-block' }}
                          animate={{ rotate: [0, 8, -8, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          {node.emoji}
                        </motion.span>
                      </motion.div>
                    </Link>
                  </div>
                )}

                {/* ── Locked ── */}
                {isLocked && (
                  <div
                    className="relative"
                    onMouseEnter={() => setHoveredLocked(node.num)}
                    onMouseLeave={() => setHoveredLocked(null)}
                    onClick={() => setTappedLocked((v) => (v === node.num ? null : node.num))}
                    onBlur={() => setTappedLocked((v) => (v === node.num ? null : v))}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'not-allowed',
                        position: 'relative',
                        opacity: 0.5,
                      }}
                      className="node-locked-shimmer"
                      role="button"
                      tabIndex={0}
                      aria-disabled="true"
                      aria-label={`${node.title}. Coming soon.`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setTappedLocked((v) => (v === node.num ? null : node.num));
                        }
                      }}
                      onFocus={() => setHoveredLocked(node.num)}
                    >
                      {/* locked emoji preview */}
                      <span
                        style={{
                          position: 'relative',
                          zIndex: 3,
                          fontSize: node.emoji === '🔒' ? 20 : 24,
                          opacity: node.emoji === '🔒' ? 0.4 : 0.5,
                          transform: 'translateY(1px)',
                        }}
                      >
                        {node.emoji}
                      </span>

                      {/* padlock badge overlay (separate from main icon) */}
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          fontSize: 14,
                          opacity: 0.85,
                          zIndex: 4,
                        }}
                      >
                        🔒
                      </span>
                    </div>
                    <AnimatePresence>
                      {showLockedTip && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-30 pointer-events-none"
                          style={{ background: 'rgba(20,12,48,0.95)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                          {`Coming soon — ${node.comingSoonTopic ?? 'More coding adventures'}`}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Label */}
                <div
                  className="text-center font-bold leading-tight mt-2"
                  style={{
                    fontSize: 10,
                    maxWidth: 96,
                    color: isCompleted ? '#5DCAA5' : isCurrent ? '#c4a8ff' : isLocked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {node.title}
                  {isLocked && node.teaser && (
                    <div style={{ marginTop: 2, fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.28)' }}>
                      {node.teaser}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Connector to Level 2 promise node */}
        <div style={{ height: 52, display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="map-connector-flow" />
        </div>

        {/* Level 2 promise node (not clickable) */}
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col items-center relative" style={{ transform: `translateX(${80}px)` }}>
            <div className="level2-node" aria-label="Level 2. JavaScript — Coming Soon." role="img">
              <div className="level2-glow" aria-hidden />
              <span style={{ position: 'relative', zIndex: 1, fontSize: 22, fontWeight: 900 }}>★</span>
            </div>
            <div className="level2-label">
              <div className="level2-title">Level 2</div>
              <div className="level2-sub">JavaScript — Coming Soon</div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Tap a node to start a lesson
        </p>
      </main>

      {/* ── Footer: ambient Byte message (no tap gate; map interaction dismisses) ── */}
      {showByteBubble && (
        <div className="fixed bottom-5 left-4 z-20 max-w-[min(100vw-2rem,320px)] pointer-events-none">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ByteTypewriter text={contextMessage} mood="idle" showTapHint={false} />
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
}
