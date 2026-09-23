import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { LESSONS, isLessonUnlocked } from '../data/lessons';
import ByteTypewriter from '../components/ByteTypewriter';
import StreakCalendar from '../components/StreakCalendar';
import StarField from '../components/StarField';

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
  ...LESSONS.map((l) => ({ id: l.id, num: l.lessonNumber, title: l.title, emoji: l.emoji })),
  { id: 'lesson-07', num: 7, title: 'Build a Button!',       emoji: '🔒', comingSoon: true, teaser: 'Make it clickable + stylish.', comingSoonTopic: 'Buttons & interactions' },
  { id: 'lesson-08', num: 8, title: 'Layout Like a Pro',      emoji: '🔒', comingSoon: true, teaser: 'Flexbox makes magic rows.', comingSoonTopic: 'Flexbox & layout' },
  { id: 'lesson-09', num: 9, title: 'Animate Your Page',      emoji: '🔒', comingSoon: true, teaser: 'Tiny motion that feels alive.', comingSoonTopic: 'CSS animations' },
  { id: 'lesson-10', num: 10, title: 'Make a Mini Game!',     emoji: '🔒', comingSoon: true, teaser: 'Score points with JS.', comingSoonTopic: 'JavaScript games' },
];

/** Real lessons are locked until the previous one is done; lessons 7+ do not exist yet. */
function lockedLabel(node: LessonNode): string {
  return node.comingSoon
    ? `${node.title}. Coming soon.`
    : `Lesson ${node.num}: ${node.title}. Locked: finish lesson ${node.num - 1} first.`
}

// Winding offsets: left, center, right, center, left...
const X_OFFSETS = [-80, 0, 80, 0, -80, 0, 80, 0, -80, 0];

/** Top inset for skill tree + vertical spine (keeps timeline aligned with connector segments). */
const SKILL_TREE_TOP_OFFSET_PX = 55;

export default function MapPage() {
  const topicName = useGameStore((s) => s.topicName);
  if (!topicName) return <Navigate to="/onboarding" replace />;
  return <MapScreen topicName={topicName} />;
}

function MapScreen({ topicName }: { topicName: string }) {
  const { completedLessons, xp, streak, playedDates } = useGameStore();
  const [hoveredLocked, setHoveredLocked] = useState<number | null>(null);
  const [tappedLocked, setTappedLocked] = useState<number | null>(null);
  const [showByteBubble, setShowByteBubble] = useState(true);
  const currentRef = useRef<HTMLDivElement | null>(null);

  const isAccessible = (node: LessonNode): boolean => {
    const lesson = LESSONS.find((l) => l.id === node.id);
    return !!lesson && isLessonUnlocked(lesson, completedLessons);
  };

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [completedLessons.length]);

  const contextMessage =
    completedLessons.length === 0
      ? 'Tap the glowing node to start your first lesson.'
      : completedLessons.length >= 6
        ? 'Look at you! You finished Level 1. Level 2 is coming soon.'
        : 'Nice work! Tap the next glowing node to keep going.';

  useEffect(() => {
    const t = window.setTimeout(() => setShowByteBubble(false), 6000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className="on-dark min-h-dvh flex flex-col items-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0f0f1a 0%, #1a0a3d 40%, #0d2040 100%)' }}
    >
      <StarField />

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
            <span aria-hidden="true" style={{ fontSize: 14 }}>🔥</span>
            <span style={{ color: '#ff9f60', fontSize: 14, fontWeight: 800 }}>{streak}<span className="sr-only"> day streak</span></span>
          </div>
          {/* XP badge */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(92,62,188,0.2)', border: '1px solid rgba(92,62,188,0.4)' }}>
            <span aria-hidden="true" style={{ fontSize: 14 }}>⭐</span>
            <span style={{ color: '#c4a8ff', fontSize: 14, fontWeight: 800 }}>{xp} XP</span>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 flex flex-col items-center">
      {/* ── Title ── */}
      <h1 className="text-white font-black text-base pt-5 pb-1" style={{ textAlign: 'center' }}>
        Your Coding Journey
      </h1>
      <p className="text-xs pb-5" style={{ color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
        {topicName} skill tree
      </p>

      {/* ── Streak Calendar (last 7 days) ── */}
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', padding: '0 20px 14px', position: 'relative', zIndex: 20 }}>
        <StreakCalendar playedDates={playedDates} />
      </div>

      {/* ── Skill Tree ── */}
      <div
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
                  <Link to={`/lesson/${node.num}`} className="block relative" aria-label={`Lesson ${node.num}: ${node.title} (completed, play again)`}>
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
                      aria-hidden="true"
                      className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-black px-3 py-1 rounded-full pointer-events-none z-10"
                      style={{ background: '#5C3EBC', color: 'white', fontSize: 11 }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      TAP!
                    </motion.div>
                    <Link to={`/lesson/${node.num}`} aria-label={`Lesson ${node.num}: ${node.title} (start here)`}>
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
                      aria-label={lockedLabel(node)}
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
                          {node.comingSoon ? `Coming soon — ${node.comingSoonTopic ?? 'More coding adventures'}` : `Finish lesson ${node.num - 1} first`}
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
      </div>

      {/* ── Footer: ambient Byte message (no tap gate; map interaction dismisses) ── */}
      {showByteBubble && (
        <div className="fixed bottom-5 left-4 z-20 max-w-[min(100vw-2rem,320px)] pointer-events-none">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ByteTypewriter text={contextMessage} mood="idle" />
          </motion.div>
        </div>
      )}
      </main>
      </div>
    </div>
  );
}
