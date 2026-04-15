import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Byte from './Byte';
import ByteTypewriter from './ByteTypewriter';
import FlowBackButton from './FlowBackButton';
import { speak, stopSpeaking } from '../utils/voice';

interface WarmUpStepProps {
  bytePrompt: string;
  instruction: string;
  onComplete: () => void;
  // FIX 5: used to show "REVIEWING FROM LESSON N" label
  lessonNumber: number;
}

export default function WarmUpStep({ bytePrompt, instruction, onComplete, lessonNumber }: WarmUpStepProps) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    speak(bytePrompt);
    return () => stopSpeaking();
  }, [bytePrompt]);

  useEffect(() => {
    // BUGFIX: warm-up/intro must never auto-advance. Timer is visual only.
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (timeLeft / 60) * circumference;

  return (
    <div className="relative flex flex-col h-full pt-14 px-6 pb-6 gap-6 overflow-y-auto">
      <FlowBackButton />
      {/* Warm-up Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: '#FEF0D6', border: '2px solid #D4581A' }}
      >
        <span className="text-2xl">⚡</span>
        <div>
          <div className="font-black uppercase text-sm tracking-[0.08em]" style={{ color: '#D4581A' }}>WARM-UP!</div>
          <div className="text-xs mt-0.5" style={{ color: '#854F0B' }}>No hearts at risk</div>
        </div>
        {/* Timer Circle */}
        <div className="ml-auto relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 70 70">
            <circle
              cx="35" cy="35" r={radius}
              fill="none"
              stroke="#FDE8C4"
              strokeWidth="6"
            />
            <circle
              cx="35" cy="35" r={radius}
              fill="none"
              stroke={timeLeft > 15 ? '#D4581A' : '#ef4444'}
              strokeWidth="6"
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm" style={{ color: '#D4581A' }}>
            {timeLeft}
          </div>
        </div>
      </motion.div>

      {/* Byte */}
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <Byte mood="idle" size={80} showSpeech={false} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-brand-border"
        >
          {/* Warm-up Byte bubble is informational only (no tap gate). */}
          <ByteTypewriter text={bytePrompt} mood="idle" showTapHint={false} />
        </motion.div>
      </div>

      {/* Instruction */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-4 border border-brand-border shadow-sm flex-1"
      >
        {/* FIX 5: show "REVIEWING FROM LESSON N" for lessons 2-6 */}
        {lessonNumber > 1 && (
          <div style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.1em',
            color: '#D4581A',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            REVIEWING FROM LESSON {lessonNumber - 1}
          </div>
        )}
        <div className="text-[11px] font-black text-brand-purple uppercase tracking-widest mb-2">YOUR MISSION</div>
        <p className="text-brand-text font-semibold leading-relaxed text-sm">{instruction}</p>
      </motion.div>
    </div>
  );
}
