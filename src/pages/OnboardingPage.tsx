import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import Byte from '../components/Byte';
import ByteTypewriter from '../components/ByteTypewriter';
import TapToContinueHint from '../components/TapToContinueHint';
import { useTapGate } from '../hooks/useTapGate';

const EXAMPLES = ["My Dog", "Space", "Minecraft", "Dinosaurs", "Pizza", "Robots"];

const CHIP_COLORS: Record<string, { bg: string; text: string; selBg: string; selBorder: string; selGlow: string }> = {
  "My Dog":    { bg: 'rgba(212,88,26,0.18)',    text: '#ffb380', selBg: '#c04d10', selBorder: '#f07030', selGlow: 'rgba(212,88,26,0.55)' },
  "Space":     { bg: 'rgba(13,124,123,0.18)',   text: '#7ef0ed', selBg: '#0a7a79', selBorder: '#5dcece', selGlow: 'rgba(13,180,178,0.5)' },
  "Minecraft": { bg: 'rgba(155,114,240,0.18)',  text: '#c4a8ff', selBg: '#5C3EBC', selBorder: '#9B72F0', selGlow: 'rgba(155,114,240,0.55)' },
  "Dinosaurs": { bg: 'rgba(155,114,240,0.18)',  text: '#c4a8ff', selBg: '#5C3EBC', selBorder: '#9B72F0', selGlow: 'rgba(155,114,240,0.55)' },
  "Pizza":     { bg: 'rgba(212,88,26,0.18)',    text: '#ffb380', selBg: '#c04d10', selBorder: '#f07030', selGlow: 'rgba(212,88,26,0.55)' },
  "Robots":    { bg: 'rgba(155,114,240,0.18)',  text: '#c4a8ff', selBg: '#5C3EBC', selBorder: '#9B72F0', selGlow: 'rgba(155,114,240,0.55)' },
};

const STAR_POSITIONS = [
  { top: '8%',  left: '55%', delay: 0 },
  { top: '18%', left: '75%', delay: 0.3 },
  { top: '12%', left: '8%',  delay: 0.7 },
  { top: '35%', left: '15%', delay: 1.1 },
  { top: '55%', left: '88%', delay: 0.5 },
  { top: '72%', left: '5%',  delay: 1.4 },
  { top: '25%', left: '92%', delay: 0.2 },
  { top: '45%', left: '40%', delay: 0.9 },
];

function Stars() {
  return (
    <>
      {STAR_POSITIONS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-[3px] h-[3px] bg-white rounded-full pointer-events-none"
          style={{ top: s.top, left: s.left }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}

function Orbs() {
  return (
    <>
      <div className="absolute pointer-events-none rounded-full"
        style={{ width: 160, height: 160, background: '#D4581A', filter: 'blur(50px)', opacity: 0.3, bottom: 80, right: -40 }} />
    </>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setTopic = useGameStore(s => s.setTopic);
  const topicName = useGameStore(s => s.topicName);
  const [step, setStep] = useState(1);
  const [inputValue, setInputValue] = useState('');
  // Screen 2: Byte cheer state
  const [byteMood, setByteMood] = useState<'idle' | 'cheer'>('idle');
  const [byteSpeech, setByteSpeech] = useState('');
  const [cheerKey, setCheerKey] = useState(0);

  const triggerByteCheer = (topic: string) => {
    setByteMood('cheer');
    setByteSpeech(`Oh WOW — ${topic}?! That is going to be AMAZING!`);
    setCheerKey(k => k + 1);
    setTimeout(() => setByteMood('idle'), 2500);
  };

  useEffect(() => {
    if (topicName) {
      navigate('/map', { replace: true });
    }
  }, [topicName, navigate]);

  const handleNext = () => {
    if (step === 2 && inputValue.trim()) {
      const trimmed = inputValue.trim();
      setTopic(trimmed);
      setInputValue(trimmed);
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      navigate('/map');
    } else if (step === 1) {
      setStep(2);
    }
  };

  const step1Gate = useTapGate(
    useCallback(() => {
      setStep(2);
    }, []),
    'onboarding-step-1',
    step === 1
  );

  return (
    <div
      className="min-h-[100dvh] w-full flex items-center justify-center overflow-hidden relative"
      style={{ background: 'linear-gradient(145deg, #1a0a3d 0%, #3d1278 50%, #1a2a6c 100%)' }}
    >
      <Orbs />
      <Stars />

      <AnimatePresence mode="wait">

        {/* ── Step 1: Meet Byte ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="flex flex-col items-center text-center px-6 z-10 w-full max-w-xl"
          >
            <div
              {...step1Gate.containerProps}
              className="relative flex flex-col items-center text-center w-full"
              style={{
                paddingTop: 80,
                paddingBottom: step1Gate.indicatorVisible ? 40 : 24,
              }}
            >
              <span className="sr-only" aria-live="polite" aria-atomic="true">
                {step1Gate.announce}
              </span>
              <motion.div
                className="relative"
                style={{ paddingTop: 70 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div style={{ filter: 'drop-shadow(0 0 28px rgba(155,114,240,0.5))' }}>
                  <Byte mood="idle" size={200} showSpeech={false} waveOnMount />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 rounded-3xl px-10 py-5 text-center"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
              >
                <p className="text-3xl font-black text-white">HI! I'M BYTE.</p>
                <p className="text-lg font-bold mt-1" style={{ color: 'white' }}>YOUR ROBOT CODING BUDDY 🤖</p>
              </motion.div>

              {step1Gate.indicatorVisible && (
                <TapToContinueHint accentColor="rgba(255,255,255,0.9)" />
              )}
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Pick a topic ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-lg px-6 flex flex-col items-center text-center z-10"
            style={{ paddingTop: 24 }}
          >
            {/* Byte at top-center with cheer reaction */}
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: 'drop-shadow(0 0 18px rgba(155,114,240,0.45))' }}
              >
                <Byte mood={byteMood} size={88} showSpeech={false} justPassed={byteMood === 'cheer'} />
              </motion.div>
              {/* Byte speech bubble */}
              <AnimatePresence>
                {byteSpeech && (
                  <motion.div
                    key={`speech-${cheerKey}`}
                    initial={{ opacity: 0, scale: 0.85, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: -10,
                      left: '105%',
                      width: 220,
                      textAlign: 'left',
                      zIndex: 30,
                    }}
                  >
                    <ByteTypewriter text={byteSpeech} mood="cheer" onContinue={() => {}} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <h1 className="text-3xl font-black text-white mb-2" style={{ fontSize: 'clamp(22px, 5vw, 28px)', lineHeight: 1.25 }}>
              WHAT DO YOU LOVE?
            </h1>
            <p className="mb-6 font-medium" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15 }}>
              We are going to build a real webpage about it!
            </p>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;
                setInputValue(val);
                if (val.trim().length >= 2) triggerByteCheer(val.trim());
              }}
              placeholder="Type your favorite thing..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              className="w-full text-center text-xl font-bold mb-6 focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.25)',
                borderRadius: 14,
                color: 'white',
                fontSize: 16,
                padding: '13px 18px',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(155,114,240,0.7)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.25)')}
            />

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {EXAMPLES.map(ex => {
                const c = CHIP_COLORS[ex] ?? CHIP_COLORS['Minecraft'];
                const selected = inputValue === ex;
                return (
                  <motion.button
                    key={ex}
                    onClick={() => {
                      setInputValue(ex);
                      triggerByteCheer(ex);
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 24,
                      fontSize: 14,
                      fontWeight: 700,
                      border: `2px solid ${selected ? c.selBorder : 'rgba(155,114,240,0.35)'}`,
                      background: selected ? c.selBg : c.bg,
                      color: selected ? 'white' : c.text,
                      boxShadow: selected ? `0 0 16px ${c.selGlow}` : 'none',
                      transform: selected ? 'scale(1.06)' : undefined,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {ex}
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              onClick={handleNext}
              disabled={!inputValue.trim()}
              animate={inputValue.trim() ? { scale: [1, 1.025, 1] } : { scale: 1 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #D4581A 0%, #f07030 100%)',
                color: 'white',
                fontSize: 17,
                fontWeight: 900,
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                boxShadow: '0 6px 24px rgba(212,88,26,0.5)',
                opacity: inputValue.trim() ? 1 : 0.5,
              }}
            >
              {inputValue.trim() ? `Let's build my ${inputValue.trim()} page →` : "LET'S GO!"}
            </motion.button>
          </motion.div>
        )}

        {/* ── Step 3: Celebrate topic choice ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8 text-center px-6 z-10"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 0 24px rgba(155,114,240,0.5))' }}
            >
              <Byte mood="cheer" size={160} showSpeech onSpeechContinue={() => {}} />
            </motion.div>
            <h2 className="text-5xl font-black text-white uppercase break-words drop-shadow-md">
              {topicName}!
            </h2>
            <div className="max-w-md text-center">
              <div
                style={{
                  fontSize: 'clamp(28px, 6vw, 38px)',
                  color: 'white',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                }}
              >
                OH WOW.{' '}
                <span style={{ color: '#FFD700', textShadow: '0 0 24px rgba(255,215,0,0.5)' }}>
                  {topicName}
                </span>
                ?!
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 'clamp(18px, 3.5vw, 24px)',
                  color: '#7ef0ed',
                  fontWeight: 700,
                }}
              >
                Your website is going to be INCREDIBLE.
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={handleNext}
              style={{
                marginTop: 16,
                padding: '14px 48px',
                background: 'linear-gradient(135deg, #D4581A 0%, #f07030 100%)',
                color: 'white',
                fontWeight: 900,
                fontSize: 18,
                border: 'none',
                borderRadius: 14,
                cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(212,88,26,0.5)',
              }}
            >
              NEXT →
            </motion.button>
          </motion.div>
        )}

        {/* ── Step 4: You are a coder now ── */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-12 px-6 w-full max-w-md text-center min-h-[100dvh] justify-center z-10"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(155,114,240,0.3)', filter: 'blur(20px)' }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Byte mood="idle" size={128} showSpeech onSpeechContinue={() => {}} />
              </motion.div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-black text-white">
                YOU ARE A CODER NOW.
              </h2>
              <p className="text-xl font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Today you will write real code.
                <br />
                The same code Google uses.
              </p>
            </div>

            <motion.button
              onClick={handleNext}
              animate={{ scale: [1, 1.025, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #D4581A 0%, #f07030 100%)',
                color: 'white',
                fontSize: 20,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 6px 28px rgba(212,88,26,0.55)',
              }}
            >
              START LESSON 1 🚀
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
