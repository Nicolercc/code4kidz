import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EditorView } from '@codemirror/view';
import { useGameStore } from '../store/gameStore';
import { getLesson, isLessonUnlocked, resolveText, type Lesson, type StrOrFn } from '../data/lessons';

import Editor from '../components/Editor';
import Preview from '../components/Preview';
import LessonPanel from '../components/LessonPanel';
import HeartBar from '../components/HeartBar';
import XPCounter from '../components/XPCounter';
import WarmUpStep from '../components/WarmUpStep';
import Byte from '../components/Byte';
import ByteTypewriter from '../components/ByteTypewriter';
import FlowBackButton from '../components/FlowBackButton';
import { useTapGate } from '../hooks/useTapGate';
import { useTimers } from '../hooks/useTimers';
import { useLessonMachine } from '../hooks/useLessonMachine';

export default function LessonPage() {
  const { id } = useParams();
  const lesson = getLesson(id);
  const topicName = useGameStore((s) => s.topicName);

  if (!lesson || !topicName || !id) return <Navigate to="/map" replace />;
  // Keyed so switching lessons remounts the screen instead of leaking state between them.
  return <LessonScreen key={lesson.id} lesson={lesson} id={id} />;
}

function LessonScreen({ lesson, id }: { lesson: Lesson; id: string }) {
  const navigate = useNavigate();
  const timers = useTimers();

  const currentStepIndex = useGameStore((s) => s.currentStepIndex);
  const code = useGameStore((s) => s.code);
  const topicName = useGameStore((s) => s.topicName);
  const hearts = useGameStore((s) => s.hearts);
  const completedLessons = useGameStore((s) => s.completedLessons);
  const isMuted = useGameStore((s) => s.isMuted);
  const { advanceStep, resetToStep, refillHearts, setMascotMood, toggleMute } = useGameStore.getState();

  // Controls the Lesson 1 intro splash.
  const [splashDone, setSplashDone] = useState(false);
  const [splashBarComplete, setSplashBarComplete] = useState(false);

  // Lets the lesson machine move the cursor when a step loads.
  const editorViewRef = useRef<EditorView | null>(null);

  const resolve = (field?: StrOrFn) => resolveText(field, topicName);

  // Entering a lesson starts at the first step with full hearts.
  useEffect(() => {
    resetToStep(0);
    refillHearts();
  }, [lesson.id, resetToStep, refillHearts]);

  // Lesson N is only playable once lesson N-1 is complete.
  useEffect(() => {
    if (!isLessonUnlocked(lesson, completedLessons)) navigate('/map', { replace: true });
  }, [lesson, completedLessons, navigate]);

  // Out of hearts: end the lesson and go back to the map.
  useEffect(() => {
    if (hearts !== 0) return;
    setMascotMood('sad', 'Zero hearts. Come back tomorrow — hearts will be full again!');
    timers.schedule('outOfHearts', () => navigate('/map'), 2000);
  }, [hearts, navigate, setMascotMood, timers]);

  // Past the last step: review mistakes (or go straight to completion).
  const finished = currentStepIndex >= lesson.steps.length;
  useEffect(() => {
    if (finished) navigate(`/review/${id}`);
  }, [finished, id, navigate]);

  const step = lesson.steps[finished ? 0 : currentStepIndex];
  const machine = useLessonMachine({
    lesson,
    step,
    stepIndex: currentStepIndex,
    topic: topicName,
    editorViewRef,
  });
  const { phase, isTyping, isStuck, justPassed, justFailed, previewFlash, previewGlow, showHighlight, onCodeChange } = machine;

  // Lesson 1's warm-up is the intro splash rather than an editor step.
  const isLesson1Warmup = step.type === 'warmup' && step.xp === 0;

  const handleSplashContinue = useCallback(() => {
    if (splashDone) return;
    setSplashDone(true);
    timers.schedule('splash', advanceStep, 150);
  }, [splashDone, advanceStep, timers]);

  const introText = resolve(lesson.byteIntro);
  const introWordCount = introText.trim() ? introText.trim().split(/\s+/).length : 0;
  const introIsShort = introWordCount > 0 && introWordCount < 12;

  const splashIntroKey = `${lesson.id}-${typeof lesson.byteIntro === 'function' ? 'fn' : String(lesson.byteIntro).slice(0, 48)}`;
  const splashGateActive = isLesson1Warmup && !splashDone;
  const splashGate = useTapGate(handleSplashContinue, splashIntroKey, splashGateActive);

  useEffect(() => {
    if (!isLesson1Warmup || splashDone || !introIsShort) return;
    timers.schedule('splashAuto', handleSplashContinue, 2000);
    return () => timers.cancel('splashAuto');
  }, [isLesson1Warmup, splashDone, introIsShort, handleSplashContinue, timers]);

  const previewBorderClass =
    previewFlash === 'pass' ? 'border-4 border-brand-green' :
    previewFlash === 'fail' ? 'border-4 border-brand-red' :
    'border-4 border-white';

  return (
    <div className="h-dvh w-full flex overflow-hidden bg-brand-bg" style={{ position: 'relative' }}>

      {/* ─────────────────────────────────────────────────────────────────
          Lesson 1 intro splash: tap/Space/Enter to continue; bottom bar is visual-only.
      ───────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isLesson1Warmup && !splashDone && (
          <motion.div
            key="lesson1-splash"
            {...splashGate.containerProps}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 100,
              background: 'linear-gradient(145deg, #1a0a3d, #3d1278, #1a2a6c)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              padding: '40px 24px',
              cursor: 'pointer',
            }}
          >
            <span className="sr-only" aria-live="polite" aria-atomic="true">
              {splashGate.announce}
            </span>
            <FlowBackButton style={{ zIndex: 102 }} />

            <Byte mood="idle" size={120} showSpeech={false} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                Lesson {lesson.lessonNumber}
              </div>
              <div style={{ color: 'white', fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: 900, letterSpacing: '-0.02em', padding: '0 8px' }}>
                {lesson.title}
              </div>
            </div>

            <div style={{ maxWidth: 420, width: '100%', pointerEvents: 'none' }}>
              <ByteTypewriter
                text={introText}
                mood="cheer"
                showTapHint={!introIsShort}
                pulseStrength={splashBarComplete ? 'strong' : 'normal'}
              />
            </div>

            {/* Visual-only progress bar — tap still required to advance */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 5,
                background: 'rgba(255,255,255,0.12)',
                pointerEvents: 'none',
              }}
            >
              <motion.div
                key={`splash-bar-${lesson.id}`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'linear' }}
                onAnimationComplete={() => setSplashBarComplete(true)}
                style={{ height: '100%', background: '#22c55e' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────
          Top Bar
      ───────────────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate('/map')}
          className="flex items-center gap-1.5 font-bold text-sm transition-colors"
          style={{ padding: '8px 16px', borderRadius: 20, border: '2px solid #D4CFF5', background: 'white', color: '#5C3EBC', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EDE9FB'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#5C3EBC'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#D4CFF5'; }}
        >
          ✕ Exit
        </button>
      </div>
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <button
          onClick={toggleMute}
          className="flex items-center justify-center font-bold text-sm transition-colors"
          style={{ width: 40, height: 36, borderRadius: 18, border: '2px solid #D4CFF5', background: 'white', color: '#5C3EBC', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EDE9FB'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#5C3EBC'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#D4CFF5'; }}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <HeartBar />
        <XPCounter />
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          Panel 1: Lesson/Byte
      ───────────────────────────────────────────────────────────────── */}
      <div className="w-1/3 h-full relative z-10 pt-16" style={{ background: 'linear-gradient(180deg, #EDE9FB 0%, #E8E3F8 100%)', borderRight: '1px solid #D4CFF5' }}>
        {step.type === 'warmup' && step.xp > 0 ? (
          // FIX 5: pass lessonNumber to show "REVIEWING FROM LESSON N" badge
          <WarmUpStep
            bytePrompt={resolve(step.bytePrompt)}
            instruction={resolve(step.instruction)}
            lessonNumber={lesson.lessonNumber}
          />
        ) : step.type === 'warmup' && step.xp === 0 ? (
          // Lesson 1 warmup placeholder — splash covers everything, nothing needed here
          null
        ) : (
          <LessonPanel
            instruction={resolve(step.instruction)}
            hint={resolve(step.hint)}
            totalSteps={lesson.steps.length - 1}
            isWarmup={false}
            justPassed={justPassed}
            justFailed={justFailed}
            isTyping={isTyping}
            isStuck={isStuck}
            failCount={machine.failCount}
          />
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          Panel 2: Editor
      ───────────────────────────────────────────────────────────────── */}
      <div className="w-1/3 h-full bg-[#1A1A2E] flex flex-col relative z-20 shadow-2xl">
        <div className="h-14 bg-[#111122] flex items-center px-4 border-b border-[#333]">
          <div className="text-[#888] font-mono text-sm">index.html</div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          {/* FIX 2: pass onEditorReady and showHighlight to Editor */}
          <Editor
            value={code}
            onChange={onCodeChange}
            onEditorReady={(view) => { editorViewRef.current = view; }}
            showHighlight={showHighlight}
          />

          {/* Validation Bar */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ${
            phase === 'passed' ? 'translate-y-0 bg-brand-green text-white' :
            phase === 'failed' && step.type !== 'warmup'
              ? 'translate-y-0 bg-brand-red text-white' :
            'translate-y-full bg-transparent'
          }`}>
            <div className="font-bold text-lg flex items-center gap-2">
              {phase === 'passed' ? '✓ Perfect!' : '✕ Keep trying...'}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          Panel 3: Preview
      ───────────────────────────────────────────────────────────────── */}
      <div className="w-1/3 h-full bg-brand-bg p-4 flex flex-col relative z-10 pt-16">
        <div className="mb-2 text-brand-muted font-bold text-sm uppercase tracking-wider pl-2">
          Live Preview
        </div>
        <motion.div
          className={`flex-1 rounded-xl overflow-hidden shadow-lg transition-colors duration-500 ${previewBorderClass}`}
          animate={previewFlash === 'fail'
            ? { boxShadow: ['0 0 0 0 rgba(185,28,28,0)', '0 0 0 6px rgba(185,28,28,0.4)', '0 0 0 0 rgba(185,28,28,0)'] }
            : { boxShadow: '0 0 0 0 rgba(0,0,0,0)' }
          }
          transition={previewFlash === 'fail' ? { duration: 1, repeat: 2 } : { duration: 0.5 }}
        >
          {/* Beat 2: green overlay glow on output */}
          <AnimatePresence>
            {previewGlow && (
              <motion.div
                initial={{ opacity: 0.35 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(26,122,78,0.08)',
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              />
            )}
          </AnimatePresence>
          <Preview code={code} />
        </motion.div>
      </div>
    </div>
  );
}
