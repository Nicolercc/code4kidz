import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import MapPage from './pages/MapPage';
import LessonPage from './pages/LessonPage';
import ReviewPage from './pages/ReviewPage';
import CompletePage from './pages/CompletePage';
import { useGameStore } from './store/gameStore';
import ByteTypewriter from './components/ByteTypewriter';
import Byte from './components/Byte';
import { motion, AnimatePresence } from 'framer-motion';
import { speak, stopSpeaking } from './utils/voice';

function daysBetween(from: string, to: string) {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.max(0, Math.floor((b - a) / 86400000));
}

function StreakBrokenOverlay() {
  const navigate = useNavigate();
  const { topicName, streakJustBroke, lastPlayedDate, playedDates, dismissStreakBroken } = useGameStore();

  const daysMissed = useMemo(() => {
    if (!lastPlayedDate) return 0;
    const last = new Date(lastPlayedDate).toDateString();
    const today = new Date().toDateString();
    const d = daysBetween(last, today);
    return Math.max(0, d);
  }, [lastPlayedDate]);

  const last7 = useMemo(() => {
    const now = new Date();
    const days: Array<{ iso: string; label: string }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      days.push({ iso, label });
    }
    return days;
  }, []);

  const playedSet = useMemo(() => new Set(playedDates), [playedDates]);
  const todayISO = new Date().toISOString().slice(0, 10);

  if (!streakJustBroke || !topicName) return null;

  useEffect(() => {
    speak('I waited for you. Come back every day and your streak grows.');
    return () => stopSpeaking();
  }, []);

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
          You were gone for {daysMissed} days. That happens to everyone.
        </div>

        <div style={{ maxWidth: 520, margin: '0 auto 18px', textAlign: 'left' }}>
          <ByteTypewriter
            text={
              "I waited for you. I kept your progress safe.\n" +
              "Come back every day and your streak grows.\n" +
              "Let us start a new one RIGHT NOW."
            }
            mood="sad"
            onContinue={() => {}}
          />
        </div>

        <div style={{ margin: '14px auto 18px', maxWidth: 420 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
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

function RouteSpeechStopper() {
  const location = useLocation();
  useEffect(() => {
    // Stop current utterance when changing routes.
    stopSpeaking();
    return () => stopSpeaking();
  }, [location.pathname]);
  return null;
}

function App() {
  const checkAndUpdateStreak = useGameStore(s => s.checkAndUpdateStreak);

  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <RouteSpeechStopper />
      <AnimatePresence>
        <StreakBrokenOverlay />
      </AnimatePresence>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/review/:id" element={<ReviewPage />} />
        <Route path="/complete/:id" element={<CompletePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;