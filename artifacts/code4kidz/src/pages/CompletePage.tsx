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
import XPCounter from '../components/XPCounter';
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
    gainXP, 
    markLessonComplete, 
    checkAndUpdateStreak,
    heartsLostThisLesson,
    completedLessons,
    streak,
    clearMistakeLog
  } = useGameStore();

  if (!lesson || !topicName) return <Navigate to="/map" replace />;

  const resolve = (field: string | ((t: string) => string) | undefined): string => {
    if (!field) return '';
    if (typeof field === 'function') return field(topicName);
    return field.replace(/\{topic\}/g, topicName);
  };

  const [milestone, setMilestone] = useState<null | 3 | 7 | 14 | 30>(null);
  useEffect(() => {
    speak(resolve(lesson.celebrationQuote));
    return () => stopSpeaking();
  }, [lesson.id]);

  const milestoneConfig = useMemo(() => {
    if (!milestone) return null;
    if (milestone === 3) {
      return { badge: '3‑Day Streak', tone: '#7A5C00', line: 'THREE DAYS. You are building a habit.', fires: 3 };
    }
    if (milestone === 7) {
      return { badge: '7‑Day Streak', tone: '#D4AF37', line: 'SEVEN DAYS IN A ROW. You are on FIRE.', fires: 7 };
    }
    if (milestone === 14) {
      return { badge: '14‑Day Streak', tone: '#5C3EBC', line: 'Two weeks. Every. Single. Day.', fires: 0 };
    }
    return { badge: '30‑Day Streak', tone: '#5C3EBC', line: 'THIRTY DAYS. Legendary.', fires: 0 };
  }, [milestone]);

  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    if (completedLessons.includes(lesson.id)) return;
    didRunRef.current = true;

    const beforeStreak = streak;

    // Confetti!
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#5C3EBC', '#D4581A', '#1A7A4E', '#7A5C00']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#5C3EBC', '#D4581A', '#1A7A4E', '#7A5C00']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
    play('complete');
    
    // Rewards
    setTimeout(() => {
      gainXP(lesson.xpReward);
      play('xpPop');
    }, 1000);

    markLessonComplete(lesson.id);
    checkAndUpdateStreak();
    clearMistakeLog(lesson.id);

    // Milestone overlay trigger based on the NEW streak value (after update)
    // Wait a tick for store update.
    setTimeout(() => {
      const after = useGameStore.getState().streak;
      const milestoneHit = (after === 3 || after === 7 || after === 14 || after === 30) && after > beforeStreak;
      if (milestoneHit) setMilestone(after as 3 | 7 | 14 | 30);
    }, 0);
  }, [lesson.id, completedLessons, gainXP, markLessonComplete, checkAndUpdateStreak, clearMistakeLog]);

  const isPerfect = heartsLostThisLesson === 0;

  return (
    <div className="complete-bg-animated min-h-dvh w-full flex flex-col items-center justify-center p-6 overflow-hidden relative">
      <FlowBackButton to="/map" label="← Map" replace />
      <div className="absolute top-6 right-6">
        <XPCounter />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative"
      >
        <AnimatePresence>
          {milestone && milestoneConfig && (
            <motion.div
              key={`milestone-${milestone}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 24,
                background: 'rgba(26, 26, 46, 0.92)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                zIndex: 50,
              }}
              onClick={() => setMilestone(null)}
            >
              <motion.div
                initial={{ scale: 0.92, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                style={{ width: '100%', maxWidth: 420, textAlign: 'center', color: 'white' }}
              >
                <div style={{ marginBottom: 10 }}>
                  <Byte mood="cheer" size={110} showSpeech={false} justPassed />
                </div>
                <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10 }}>
                  {milestoneConfig.line}
                </div>
                {milestoneConfig.fires > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
                    {Array.from({ length: milestoneConfig.fires }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8, scale: 0.6 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.12, type: 'spring', stiffness: 260, damping: 16 }}
                        style={{ fontSize: 22 }}
                      >
                        🔥
                      </motion.div>
                    ))}
                  </div>
                )}
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)',
                    border: `2px solid ${milestoneConfig.tone}`,
                    color: 'white',
                    fontWeight: 900,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  {milestoneConfig.badge}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
                  Tap to continue
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {isPerfect && (
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute -top-6 -right-6 w-24 h-24 bg-brand-gold text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white rotate-12"
          >
            <div className="text-center">
              <div className="text-3xl">⭐</div>
              <div className="text-[10px] font-black uppercase">Perfect</div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="w-32 h-32 mx-auto mb-6 flex items-center justify-center bg-brand-orangeL rounded-full"
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: [0, 1.3, 1.0],
            rotate: [0, -8, 8, -4, 4, 0],
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-6xl">🏆</span>
          </motion.div>
        </motion.div>

        <h1 className="text-3xl font-black text-brand-purple uppercase mb-2">
          LESSON {lesson.lessonNumber} COMPLETE!
        </h1>
        <h2 className="text-xl font-bold text-brand-dark mb-8">
          {lesson.title}
        </h2>

        <div className="bg-brand-purpleL rounded-2xl p-6 mb-8 text-left relative">
          <div className="absolute -top-6 left-6">
            <Byte mood="celebrate" size={72} showSpeech onSpeechContinue={() => {}} />
          </div>
          <p className="text-brand-purple font-medium text-lg mt-4 leading-relaxed">
            "{resolve(lesson.celebrationQuote)}"
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/map')}
            className="w-full py-4 bg-brand-purple text-white font-black text-xl rounded-2xl shadow-[0_6px_0_#3A2482] active:shadow-[0_0px_0_#3A2482] active:translate-y-[6px] transition-all"
          >
            CONTINUE
          </button>
          
          <button
            onClick={() => navigator.clipboard.writeText(`I just completed Lesson ${lesson.lessonNumber} on Code4Kidz! 🤖✨`)}
            className="w-full py-4 bg-brand-bg text-brand-purple font-bold text-lg rounded-2xl hover:bg-brand-purpleP transition-colors"
          >
            Share Achievement
          </button>
        </div>
      </motion.div>
    </div>
  );
}