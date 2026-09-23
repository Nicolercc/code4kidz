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
import ContinueButton from '../components/ContinueButton';
import { useTapGate } from '../hooks/useTapGate';
import { useTimers } from '../hooks/useTimers';
import { useLessonMachine } from '../hooks/useLessonMachine';

type MobileView = 'instructions' | 'code' | 'preview';
const MOBILE_VIEWS: { view: MobileView; label: string }[] = [
  { view: 'instructions', label: 'Instructions' },
  { view: 'code', label: 'Code' },
  { view: 'preview', label: 'Preview' },
];

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
    setMascotMood('sad', 'Out of hearts. Take a breath, then start this lesson again with full hearts.');
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
  const { phase, isTyping, isStuck, justPassed, justFailed, previewFlash, previewGlow, showHighlight, onCodeChange, checkNow } = machine;

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

  const splashActive = isLesson1Warmup && !splashDone;
  const splashGate = useTapGate(handleSplashContinue, splashActive);

  useEffect(() => {
    if (!splashActive || !introIsShort) return;
    timers.schedule('splashAuto', handleSplashContinue, 2000);
    return () => timers.cancel('splashAuto');
  }, [splashActive, introIsShort, handleSplashContinue, timers]);

  // Below the md breakpoint only one panel fits; each new step starts on Instructions.
  const [mobileView, setMobileView] = useState<MobileView>('instructions');
  useEffect(() => setMobileView('instructions'), [currentStepIndex]);
  const panelVisibility = (view: MobileView) => (mobileView === view ? 'flex' : 'hidden') + ' md:flex';

  const mascotMood = useGameStore((s) => s.mascotMood);
  const byteMessage = useGameStore((s) => s.byteMessage);

  const stepCount = lesson.steps.length - 1;
  const stepLabel = currentStepIndex === 0 ? (isLesson1Warmup ? 'Intro' : 'Warm-up') : `Step ${currentStepIndex} of ${stepCount}`;

  const previewBorderClass =
    previewFlash === 'pass' ? 'border-4 border-brand-green' :
    previewFlash === 'fail' ? 'border-4 border-brand-red' :
    'border-4 border-white';

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden bg-brand-bg" style={{ position: 'relative' }}>

      {/* Lesson 1 intro. Tap anywhere, or use the focused Continue button. */}
      <AnimatePresence>
        {splashActive && (
          <motion.section
            key="lesson1-splash"
            className="on-dark"
            aria-labelledby="lesson-intro-title"
            {...splashGate.regionProps}
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
            <FlowBackButton style={{ zIndex: 102 }} />

            <Byte mood="idle" size={120} showSpeech={false} />

            <h1 id="lesson-intro-title" style={{ textAlign: 'center', margin: 0 }}>
              <span style={{ display: 'block', color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                Lesson {lesson.lessonNumber}
              </span>
              <span style={{ display: 'block', color: 'white', fontSize: 'clamp(18px, 5vw, 26px)', fontWeight: 900, letterSpacing: '-0.02em', padding: '0 8px' }}>
                {lesson.title}
              </span>
            </h1>

            <div style={{ maxWidth: 420, width: '100%' }}>
              <ByteTypewriter text={introText} mood="cheer" />
            </div>

            <ContinueButton accentColor="#ffffff" {...splashGate.buttonProps} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Hidden from assistive tech (and unfocusable) while the intro covers it. */}
      {/* A normal row on phones; floats over the panels' top padding from md up. */}
      <header
        inert={splashActive}
        className="relative z-50 flex items-center justify-between gap-2 px-3 py-2 md:absolute md:inset-x-0 md:top-0 md:p-4 md:pointer-events-none"
      >
        <div className="md:pointer-events-auto">
          <button
            type="button"
            onClick={() => navigate('/map')}
            className="lesson-chip flex items-center gap-1.5 font-bold text-sm"
            style={{ padding: '8px 16px' }}
          >
            <span aria-hidden="true">✕</span> Exit
          </button>
        </div>
        <div className="flex items-center gap-2 md:gap-3 md:pointer-events-auto">
          <button
            type="button"
            onClick={toggleMute}
            className="lesson-chip flex items-center justify-center font-bold text-sm"
            style={{ width: 44, height: 44 }}
            aria-label={isMuted ? 'Turn sound effects on' : 'Turn sound effects off'}
          >
            <span aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
          </button>
          <HeartBar />
          <XPCounter />
        </div>
      </header>

      <nav aria-label="Lesson panels" inert={splashActive} className="md:hidden flex gap-1 px-3 pb-2">
        {MOBILE_VIEWS.map(({ view, label }) => (
          <button
            key={view}
            type="button"
            aria-pressed={mobileView === view}
            onClick={() => setMobileView(view)}
            className={`flex-1 rounded-full py-2 text-sm font-bold border-2 ${
              mobileView === view ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-brand-purple border-[#D4CFF5]'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="flex-1 min-h-0 flex flex-col md:flex-row w-full" aria-labelledby="lesson-heading" inert={splashActive}>
        <h1 id="lesson-heading" className="sr-only">
          Lesson {lesson.lessonNumber}: {lesson.title} — {stepLabel}
        </h1>
        {/* Always present (panels can be hidden on phones), so screen readers hear
            every message from Byte. The green "cheer" bubble means a step passed. */}
        <p role="status" aria-atomic="true" className="sr-only">
          {mascotMood === 'cheer' && byteMessage ? 'Correct! ' : ''}{byteMessage}
        </p>

        <section aria-label="Instructions" className={`${panelVisibility('instructions')} flex-col flex-1 min-h-0 md:flex-none md:w-1/3 md:h-full relative z-10 md:pt-16`} style={{ background: 'linear-gradient(180deg, #EDE9FB 0%, #E8E3F8 100%)', borderRight: '1px solid #D4CFF5' }}>
          <div className="flex-1 min-h-0">
          {step.type === 'warmup' && step.xp > 0 ? (
            <WarmUpStep
              bytePrompt={resolve(step.bytePrompt)}
              instruction={resolve(step.instruction)}
              lessonNumber={lesson.lessonNumber}
            />
          ) : isLesson1Warmup ? null : (
            <LessonPanel
              instruction={resolve(step.instruction)}
              hint={resolve(step.hint)}
              totalSteps={stepCount}
              isWarmup={false}
              justPassed={justPassed}
              justFailed={justFailed}
              isTyping={isTyping}
              isStuck={isStuck}
              />
          )}
          </div>
          <div className="md:hidden p-3 border-t border-[#D4CFF5]">
            <button
              type="button"
              onClick={() => setMobileView('code')}
              className="w-full rounded-full bg-brand-purple text-white font-bold py-3"
            >
              Start coding <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <section aria-label="Code editor" className={`on-dark ${panelVisibility('code')} flex-col flex-1 min-h-0 md:flex-none md:w-1/3 md:h-full bg-[#1A1A2E] relative z-20 shadow-2xl`}>
          <div className="h-14 bg-[#111122] flex items-center justify-between gap-3 px-4 border-b border-[#333]">
            <div className="text-[#A9A9B8] font-mono text-sm" aria-hidden="true">index.html</div>
            {!isLesson1Warmup && (
              <button
                type="button"
                onClick={checkNow}
                disabled={phase === 'passed'}
                aria-keyshortcuts="Control+Enter Meta+Enter"
                className="rounded-full bg-[#FFD966] text-[#1A1A2E] font-bold text-sm px-4 disabled:opacity-60"
                style={{ minHeight: 40 }}
              >
                Check my code
              </button>
            )}
          </div>
          <div className="flex-1 relative overflow-hidden">
            <Editor
              value={code}
              onChange={onCodeChange}
              onEditorReady={(view) => { editorViewRef.current = view; }}
              showHighlight={showHighlight}
              onSubmit={checkNow}
            />

            {/* Visual result bar. Screen readers get the same news from Byte's status bubble. */}
            <div
              aria-hidden="true"
              className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ${
                phase === 'passed' ? 'translate-y-0 bg-brand-green text-white' :
                phase === 'failed' && step.type !== 'warmup' ? 'translate-y-0 bg-brand-red text-white' :
                'translate-y-full bg-transparent'
              }`}
            >
              <div className="font-bold text-lg flex items-center gap-2">
                {phase === 'passed' ? '✓ Perfect!' : phase === 'failed' ? '✕ Keep trying...' : null}
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Live preview" className={`${panelVisibility('preview')} flex-col flex-1 min-h-0 md:flex-none md:w-1/3 md:h-full bg-brand-bg p-4 relative z-10 md:pt-16`}>
          <div className="mb-2 text-brand-muted font-bold text-sm uppercase tracking-wider pl-2" aria-hidden="true">
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
            <AnimatePresence>
              {previewGlow && (
                <motion.div
                  initial={{ opacity: 0.35 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(26,122,78,0.08)', pointerEvents: 'none', zIndex: 5 }}
                />
              )}
            </AnimatePresence>
            <Preview code={code} />
          </motion.div>
        </section>
      </main>
    </div>
  );
}
