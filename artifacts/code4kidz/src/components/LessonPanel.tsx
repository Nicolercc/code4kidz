import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import Byte from './Byte';
import ByteTypewriter, { type BubbleMood } from './ByteTypewriter';
import HintButton from './HintButton';
import StepProgress from './StepProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { speak } from '../utils/voice';

interface LessonPanelProps {
  instruction: string;
  hint: string;
  totalSteps: number;
  isWarmup: boolean;
  justPassed?: boolean;
  justFailed?: boolean;
  isTyping?: boolean;
  isStuck?: boolean;
}

// ── Typing indicator (3 bouncing dots) ────────────────────────────────────────
function TypingDots() {
  return (
    <motion.div
      className="flex items-center gap-1.5 mt-2 pl-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-brand-purple/40"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
      <span className="text-[11px] text-brand-muted font-medium ml-1">Byte is watching...</span>
    </motion.div>
  );
}

export default function LessonPanel({
  instruction,
  hint,
  totalSteps,
  isWarmup,
  justPassed = false,
  justFailed = false,
  isTyping = false,
  isStuck = false,
}: LessonPanelProps) {
  const { mascotMood, byteMessage, failCount, currentStepIndex } = useGameStore();
  const btMood: BubbleMood = mascotMood === 'celebrate' ? 'cheer' : (mascotMood as BubbleMood);

  // Voice reads what is already on screen.
  // This is the central source of truth for prompts/cheers throughout the lesson flow.
  // (speak() itself checks mute + voiceEnabled.)
  useEffect(() => {
    speak(byteMessage);
  }, [byteMessage]);

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto">
      <div className="flex-none mb-8">
        {!isWarmup && (
          <StepProgress currentStep={currentStepIndex} totalSteps={totalSteps} />
        )}
      </div>

      <div className="flex gap-6 mb-8 relative">
        <div className="flex-none">
          <Byte
            mood={mascotMood}
            size={96}
            showSpeech={false}
            justPassed={justPassed}
            justFailed={justFailed}
            lessonMount
          />
          {/* Typing indicator below Byte */}
          <AnimatePresence>
            {isTyping && !justPassed && !justFailed && <TypingDots />}
          </AnimatePresence>
        </div>

        <div className="flex-1 min-w-0">
          <ByteTypewriter text={byteMessage} mood={btMood} />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm" style={{ border: '1.5px solid #D4CFF5' }}>
        <p className="text-[11px] font-black uppercase tracking-widest text-brand-purple mb-2.5">YOUR MISSION</p>
        <div className="text-base leading-[1.65] whitespace-pre-wrap font-medium text-brand-dark">
          {instruction}
        </div>

        <HintButton hint={hint} isVisible={failCount >= 2} isStuck={isStuck} />
      </div>
    </div>
  );
}
