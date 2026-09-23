import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EditorView } from '@codemirror/view';
import { useGameStore } from '../store/gameStore';
import { lesson01, type LessonStep } from '../data/lessons/lesson-01';
import { lesson02 } from '../data/lessons/lesson-02';
import { lesson03 } from '../data/lessons/lesson-03';
import { lesson04 } from '../data/lessons/lesson-04';
import { lesson05 } from '../data/lessons/lesson-05';
import { lesson06 } from '../data/lessons/lesson-06';
import { validate } from '../utils/validator';
import { play } from '../utils/sounds';

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
import { speak, stopSpeaking } from '../utils/voice';

const lessons = {
  '1': lesson01,
  '2': lesson02,
  '3': lesson03,
  '4': lesson04,
  '5': lesson05,
  '6': lesson06,
};

const STUCK_THRESHOLD_MS = 20_000;
const TYPING_WINDOW_MS   = 2_000;
const VALIDATION_DEBOUNCE_MS = 1_500;
const FAIL_MESSAGE_DELAY_MS  = 1_000;

// FIX 2: handoff messages shown before the real bytePrompt when startingCode is pre-filled
function getHandoffText(stepType: string, topicName: string): string | null {
  switch (stepType) {
    case 'write':
      return null;
    case 'fix':
    case 'identify':
      return `Uh oh — I wrote this code and made a mistake.\nFind it and fix it. The preview will tell you when it is right.`;
    case 'combine':
      return `Look — your whole page is here.\nNOW make it yours. Change that h1 to something real about\n${topicName}. I want to see YOUR words on the screen.`;
    default:
      return null;
  }
}

export default function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lesson = lessons[id as keyof typeof lessons];

  const {
    currentStepIndex,
    code,
    updateCode,
    failCount,
    incrementFail,
    advanceStep,
    resetToStep,
    gainXP,
    loseHeart,
    refillHearts,
    resetFail,
    setMascotMood,
    recordMistake,
    topicName,
    hearts,
    setHasEdited,
    completedLessons,
    isMuted,
    toggleMute,
    voiceEnabled,
    toggleVoiceEnabled,
  } = useGameStore();

  const [validationState, setValidationState] = useState<'idle' | 'pass' | 'fail'>('idle');
  const validationStateRef = useRef(validationState);
  useEffect(() => {
    validationStateRef.current = validationState;
  }, [validationState]);
  const [justPassed, setJustPassed]   = useState(false);
  const [justFailed, setJustFailed]   = useState(false);
  const [isTyping,   setIsTyping]     = useState(false);
  const [isStuck,    setIsStuck]      = useState(false);
  const [previewBorder, setPreviewBorder] = useState<'idle' | 'flash-pass' | 'pulse-fail'>('idle');
  const [previewWinGlow, setPreviewWinGlow] = useState(false);
  const passAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FIX 1: controls the Lesson 1 cinematic splash
  const [splashDone, setSplashDone] = useState(false);
  const [splashBarComplete, setSplashBarComplete] = useState(false);

  // FIX 2: purple tint overlay on the editor when scaffolded code appears
  const [showHighlight, setShowHighlight] = useState(false);

  // FIX 2: expose EditorView to position the cursor when a step loads
  const editorViewRef = useRef<EditorView | null>(null);

  const iframeRef      = useRef<HTMLIFrameElement>(null);
  const validationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stuckTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepLoadingRef = useRef(false);
  const lastCodeRef    = useRef(code);
  const hasTypedRef    = useRef(false);
  /** True after this step has validated as pass; blocks stale debounced validation runs. */
  const passRecordedRef = useRef(false);
  const stepRef = useRef<LessonStep | null>(null);

  if (!lesson || !topicName) return <Navigate to="/map" replace />;

  const resolve = (field: string | ((t: string) => string) | undefined): string => {
    if (!field) return '';
    if (typeof field === 'function') return field(topicName);
    return field.replace(/\{topic\}/g, topicName);
  };

  // Reset lesson on ID change
  useEffect(() => {
    resetToStep(0);
    updateCode('');
    lastCodeRef.current = '';
    hasTypedRef.current = false;
    setSplashDone(false);
    setSplashBarComplete(false);
    stopSpeaking();
  }, [lesson.id]);

  // FAIL fix: entering a lesson refills hearts and clears fail counter
  useEffect(() => {
    refillHearts();
    resetFail();
  }, [lesson.id, refillHearts, resetFail]);

  // FAIL fix: block access to lesson N unless lesson N-1 is completed
  useEffect(() => {
    if (!lesson) return;
    const order = ['lesson-01', 'lesson-02', 'lesson-03', 'lesson-04', 'lesson-05', 'lesson-06'];
    const idx = order.indexOf(lesson.id);
    if (idx > 0) {
      const prev = order[idx - 1];
      if (!completedLessons.includes(prev)) {
        navigate('/map', { replace: true });
      }
    }
  }, [lesson?.id, completedLessons, navigate]);

  // FAIL fix: when hearts hit 0, end the lesson and return to map
  useEffect(() => {
    if (hearts !== 0) return;
    setMascotMood('sad', 'Zero hearts. Come back tomorrow — hearts will be full again!');
    const t = setTimeout(() => navigate('/map'), 2000);
    return () => clearTimeout(t);
  }, [hearts, navigate, setMascotMood]);

  const safeStepIndex = currentStepIndex < lesson.steps.length ? currentStepIndex : 0;
  const step = lesson.steps[safeStepIndex];

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Determine if we're on the Lesson 1 auto-advance warmup
  const isLesson1Warmup = step?.type === 'warmup' && step?.xp === 0;

  // Initialize step
  useEffect(() => {
    stepLoadingRef.current = true;
    window.setTimeout(() => { stepLoadingRef.current = false }, 200);

    // Cancel any pending message timers from the previous step.
    if (handoffTimerRef.current) clearTimeout(handoffTimerRef.current);
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);

    if (currentStepIndex >= lesson.steps.length) {
      navigate(`/review/${id}`);
      return;
    }

    if (step) {
      passRecordedRef.current = false;
      passAdvanceTimerRef.current = null;
      const initialCode = resolve(step.startingCode);
      lastCodeRef.current = initialCode;
      updateCode(initialCode);
      setValidationState('idle');
      setIsTyping(false);
      setIsStuck(false);
      hasTypedRef.current = false;
      // Reset the per-step edit guard (must not persist across steps/sessions).
      useGameStore.setState({ hasEditedCurrentStep: false });

      if (step.type === 'warmup') {
        // BUGFIX: intro/warmup should start in idle (open eyes), not cheer.
        setMascotMood('idle', resolve(step.bytePrompt));
        // FIX 1: Lesson 1 cinematic splash — full-screen tap gate; bottom bar is visual-only (no auto-advance).
        // Lessons 2–6 warmup: kid advances when ready (no auto-advance).
      } else {
        // Delay message setup so the cheer from the previous step has time to be seen.
        // Cheer is set 700ms before advanceStep fires; a 400ms delay yields ~1200ms visibility.
        const MESSAGE_DELAY = 400;

        const startCode = resolve(step.startingCode);

        // FIX 2: if this step has pre-filled code, show handoff message then real prompt
        if (startCode) {
          // Purple tint on editor: show immediately, fade out after 1.5s
          setShowHighlight(true);
          setTimeout(() => setShowHighlight(false), 100); // short delay then start fade

          handoffTimerRef.current = setTimeout(() => {
            const handoff = getHandoffText(step.type, topicName);
            if (handoff) {
              const handoffMood =
                step.type === 'combine'
                  ? 'think'
                  : (step.type === 'fix' || step.type === 'identify' ? 'sad' : 'think');

              setMascotMood(handoffMood, handoff);
              promptTimerRef.current = setTimeout(() => {
                setMascotMood(safeStepIndex === 1 ? 'story' : 'idle', resolve(step.bytePrompt));
              }, 2000);
            } else {
              setMascotMood(safeStepIndex === 1 ? 'story' : 'idle', resolve(step.bytePrompt));
            }
          }, MESSAGE_DELAY);

          // FIX 2: position cursor based on step type
          // Uses 150ms delay to ensure the editor has processed the new value
          setTimeout(() => {
            const view = editorViewRef.current;
            if (!view) return;
            const docLen = view.state.doc.length;
            const currentCode = resolve(step.startingCode);

            const clamp = (n: number) => Math.max(0, Math.min(n, docLen));

            if (step.type === 'fix' || step.type === 'identify') {
              view.dispatch({ selection: { anchor: 0, head: 0 }, scrollIntoView: true });
              view.focus();
            } else if (step.type === 'combine') {
              const h1Match = currentCode.match(/<h1[^>]*>(.*?)<\/h1>/i);
              if (h1Match && h1Match[1]) {
                const h1Content = h1Match[1];
                const startPos = currentCode.indexOf(h1Content);
                if (startPos !== -1) {
                  const anchor = clamp(startPos);
                  const head = clamp(startPos + h1Content.length);
                  view.dispatch({ selection: { anchor, head }, scrollIntoView: true });
                  view.focus();
                }
              }
            } else if (step.type === 'write') {
              view.dispatch({ selection: { anchor: docLen, head: docLen }, scrollIntoView: true });
              view.focus();
            }
          }, 150);
        } else {
          // No startingCode — no handoff, no highlight, no cursor trick needed
          handoffTimerRef.current = setTimeout(() => {
            setMascotMood(safeStepIndex === 1 ? 'story' : 'idle', resolve(step.bytePrompt));
          }, MESSAGE_DELAY);
        }
      }
    }
  }, [currentStepIndex, lesson.id]);

  // Force-reset editor to startingCode for 'fix' and 'identify' steps
  useEffect(() => {
    if (!step) return;
    if (step.type === 'fix' || step.type === 'identify') {
      const startingCode = resolve(step.startingCode);
      if (startingCode) {
        updateCode(startingCode);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex, lesson.id]);

  // Preview border resets after flash
  useEffect(() => {
    if (previewBorder !== 'flash-pass') return;
    const t = setTimeout(() => setPreviewBorder('idle'), 1500);
    return () => clearTimeout(t);
  }, [previewBorder]);

  const handleCodeChange = (newCode: string) => {
    if (passAdvanceTimerRef.current) return;
    updateCode(newCode);
    lastCodeRef.current = newCode;
    hasTypedRef.current = true;

    // FIX 3: mark that the kid has typed at least once on this step
    setHasEdited();

    if (validationTimerRef.current) clearTimeout(validationTimerRef.current);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    // Hide any visible fail state immediately on keystroke.
    if (validationState === 'fail') setMascotMood('idle', '');
    setValidationState('idle');

    setIsTyping(true);
    setIsStuck(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => setIsTyping(false), TYPING_WINDOW_MS);

    if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);
    stuckTimerRef.current = setTimeout(() => {
      if (validationState !== 'pass') {
        setIsStuck(true);
        setMascotMood('think', "Take your time. What does the instruction say to type?\nLook at the preview — does it match what you want?");
      }
    }, STUCK_THRESHOLD_MS);

    validationTimerRef.current = setTimeout(() => {
      if (validationStateRef.current === 'pass') return;
      if (!stepRef.current) return;
      if (!iframeRef.current) return;
      if (passRecordedRef.current) return;

      const result = validate(iframeRef, stepRef.current, lastCodeRef.current);
      const codeSnapshot = lastCodeRef.current;

      if (result === 'pass') {
        passRecordedRef.current = true;
        setValidationState('pass');
        // Beat 1: sound FIRST (instant)
        play('correct');

        // Beat 2: output glows (preview), not the editor
        setPreviewWinGlow(true);
        setTimeout(() => setPreviewWinGlow(false), 1500);

        setPreviewBorder('flash-pass');

        setJustPassed(true);
        setTimeout(() => setJustPassed(false), 2000);

        setIsStuck(false);
        setIsTyping(false);
        if (stuckTimerRef.current) clearTimeout(stuckTimerRef.current);

        const STEP_PASS_MESSAGES: Record<string, string[]> = {
          'lesson-01': [
            "Yes! That is the foundation of EVERY website.",
            "The head is in! Your page has a brain now.",
            "Space! That is your page title. Look at the browser tab.",
            "You found my bug! See how the slash makes it close?",
            "YOUR words. YOUR page. Look at that preview.",
          ],
          'lesson-02': [
            "h1 — the biggest heading on the internet. Yours.",
            "h2 is smaller. The hierarchy is working.",
            "Three levels of headings. Real web designers do this.",
            "Found it! That slash was the whole problem.",
            "Two h2s! Wikipedia uses exactly this structure.",
          ],
          'lesson-03': [
            "First paragraph done. Your page is talking.",
            "Two paragraphs. Your Space page has things to say.",
            "Three paragraphs — a beginning, middle, and end.",
            "Fixed it! Every p needs its partner.",
            "That is YOUR best paragraph. Read it back.",
          ],
        };

        const messages = STEP_PASS_MESSAGES[lesson.id] ?? [];
        // currentStepIndex - 1 because warmup is index 0
        const messageIndex = Math.max(0, currentStepIndex - 1);
        const passMsg = messages[messageIndex] ?? 'Perfect! You are building something real.';

        // Beat 3/5: physical reaction now (jump), speech after landing
        setMascotMood('idle', '');
        setTimeout(() => setMascotMood('cheer', passMsg), 700);

        // Beat 4: XP starts shortly after win
        const gained = failCount === 0 ? step.xp : Math.floor(step.xp / 2);
        setTimeout(() => gainXP(gained), 200);

        if (failCount > 0) {
          recordMistake(lesson.id, {
            stepId: step.id,
            failCount,
            instruction: resolve(step.instruction),
            startingCode: resolve(step.startingCode),
          });
        }

        // Auto-advance after celebration (no tap gates in the editor flow).
        passAdvanceTimerRef.current = setTimeout(() => {
          passAdvanceTimerRef.current = null;
          advanceStep();
        }, 1500);
      } else {
        // Code is wrong — but don't show a fail message until they've been idle longer.
        messageTimerRef.current = setTimeout(() => {
          if (lastCodeRef.current !== codeSnapshot) return;
          if (stepRef.current?.type === 'warmup') return;

          setValidationState('fail');
          setPreviewBorder('pulse-fail');

          // Only count a "fail" once the message is actually shown (never mid-keystroke).
          incrementFail();
          play('wrong');

          setJustFailed(true);
          setTimeout(() => setJustFailed(false), 1000);
          setTimeout(() => setPreviewBorder('idle'), 2200);

          if ((failCount + 1) % 3 === 0 && hearts > 0) {
            loseHeart();
          } else {
            setMascotMood('think', "Not quite! Check the hint if you need help.");
          }
        }, FAIL_MESSAGE_DELAY_MS);
      }
    }, VALIDATION_DEBOUNCE_MS);
  };

  const handleSplashContinue = useCallback(() => {
    if (splashDone) return;
    setSplashDone(true);
    setTimeout(() => advanceStep(), 150);
  }, [splashDone, advanceStep]);

  const introText = resolve(lesson.byteIntro);
  const introWordCount = introText.trim() ? introText.trim().split(/\s+/).length : 0;
  const introIsShort = introWordCount > 0 && introWordCount < 12;

  const splashIntroKey =
    step && lesson
      ? `${lesson.id}-${typeof lesson.byteIntro === 'function' ? 'fn' : String(lesson.byteIntro).slice(0, 48)}`
      : 'none';

  const splashGateActive = !!(isLesson1Warmup && !splashDone && step);
  const splashGate = useTapGate(handleSplashContinue, splashIntroKey, splashGateActive);

  useEffect(() => {
    if (!isLesson1Warmup) return;
    if (splashDone) return;
    if (!introIsShort) return;
    const t = window.setTimeout(() => handleSplashContinue(), 2000);
    return () => window.clearTimeout(t);
  }, [isLesson1Warmup, splashDone, introIsShort, handleSplashContinue]);

  useEffect(() => {
    if (!isLesson1Warmup) return;
    if (splashDone) return;
    speak(introText);
    return () => stopSpeaking();
  }, [lesson.id, isLesson1Warmup, splashDone, introText]);

  if (!step) return null;

  const previewBorderClass =
    previewBorder === 'flash-pass' ? 'border-4 border-brand-green' :
    previewBorder === 'pulse-fail' ? 'border-4 border-brand-red' :
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
          onClick={toggleVoiceEnabled}
          className="flex items-center justify-center font-bold text-sm transition-colors"
          style={{ width: 40, height: 36, borderRadius: 18, border: '2px solid #D4CFF5', background: 'white', color: '#5C3EBC', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#EDE9FB'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#5C3EBC'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#D4CFF5'; }}
          aria-label={voiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
          title={voiceEnabled ? 'Voice on' : 'Voice off'}
        >
          {voiceEnabled ? '🗣️' : '🗣️🚫'}
        </button>
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
            onComplete={advanceStep}
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
            onChange={handleCodeChange}
            onEditorReady={(view) => { editorViewRef.current = view; }}
            showHighlight={showHighlight}
          />

          {/* Validation Bar */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ${
            validationState === 'pass' ? 'translate-y-0 bg-brand-green text-white' :
            validationState === 'fail' && step?.type !== 'warmup'
              ? 'translate-y-0 bg-brand-red text-white' :
            'translate-y-full bg-transparent'
          }`}>
            <div className="font-bold text-lg flex items-center gap-2">
              {validationState === 'pass' ? '✓ Perfect!' : '✕ Keep trying...'}
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
          animate={previewBorder === 'pulse-fail'
            ? { boxShadow: ['0 0 0 0 rgba(185,28,28,0)', '0 0 0 6px rgba(185,28,28,0.4)', '0 0 0 0 rgba(185,28,28,0)'] }
            : { boxShadow: '0 0 0 0 rgba(0,0,0,0)' }
          }
          transition={previewBorder === 'pulse-fail' ? { duration: 1, repeat: 2 } : { duration: 0.5 }}
        >
          {/* Beat 2: green overlay glow on output */}
          <AnimatePresence>
            {previewWinGlow && (
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
          <Preview code={code} onIframeReady={(iframe) => { iframeRef.current = iframe; }} />
        </motion.div>
      </div>
    </div>
  );
}
