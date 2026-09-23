import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';

import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import MapPage from './pages/MapPage';
// The editor screens pull in CodeMirror and confetti; load them on first visit
// so the landing page and map stay light.
const LessonPage = lazy(() => import('./pages/LessonPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const CompletePage = lazy(() => import('./pages/CompletePage'));

function PageLoading() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-brand-bg text-brand-dark font-bold">
      <h1 role="status">Loading your lesson…</h1>
    </main>
  );
}
import NotFoundPage from './pages/NotFoundPage';
import { useGameStore } from './store/gameStore';
import ByteTypewriter from './components/ByteTypewriter';
import Byte from './components/Byte';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';
import StreakCalendar from './components/StreakCalendar';

export function StreakBrokenOverlay() {
  const navigate = useNavigate();
  const { topicName, streakBrokenAfterDaysMissed: daysMissed, playedDates, dismissStreakBroken } = useGameStore();
  const isVisible = daysMissed !== null && !!topicName;

  // All hooks above run on every render; only the output is conditional.
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'linear-gradient(145deg, #1a0a3d 0%, #3d1278 50%, #1a2a6c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Byte mood="sad" size={140} showSpeech={false} />
        </div>

        <div style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 8 }}>
          Oh no. Your streak broke.
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 18 }}>
          You were gone for {daysMissed} {daysMissed === 1 ? 'day' : 'days'}. That happens to everyone.
        </div>

        <div style={{ maxWidth: 520, margin: '0 auto 18px', textAlign: 'left' }}>
          <ByteTypewriter
            text={
              "I waited for you. I kept your progress safe.\n" +
              "Come back every day and your streak grows.\n" +
              "Let us start a new one RIGHT NOW."
            }
            mood="sad"
          />
        </div>

        <div style={{ margin: '14px auto 18px', maxWidth: 420 }}>
          <StreakCalendar playedDates={playedDates} />
          <div style={{ marginTop: 12, fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>
            Today is Day 1 of your new streak
          </div>
        </div>

        <motion.button
          onClick={() => {
            dismissStreakBroken();
            navigate('/map', { replace: true });
          }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '100%',
            padding: '16px 18px',
            borderRadius: 16,
            border: 'none',
            background: 'linear-gradient(135deg, #D4581A 0%, #f07030 100%)',
            color: 'white',
            fontWeight: 900,
            fontSize: 18,
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(212,88,26,0.45)',
          }}
        >
          START FRESH
        </motion.button>
      </div>
    </motion.div>
  );
}

function App() {
  const checkStreak = useGameStore((s) => s.checkStreak);

  // Opening the app only checks for a missed day; practising grows the streak.
  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  return (
    <ErrorBoundary>
      {/* Every framer-motion animation follows the OS "reduce motion" setting. */}
      <MotionConfig reducedMotion="user">
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AnimatePresence>
          <StreakBrokenOverlay />
        </AnimatePresence>
        <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/review/:id" element={<ReviewPage />} />
          <Route path="/complete/:id" element={<CompletePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;