import { motion } from 'framer-motion';
import Byte from './Byte';
import ByteTypewriter from './ByteTypewriter';

interface WarmUpStepProps {
  bytePrompt: string;
  instruction: string;
  // FIX 5: used to show "REVIEWING FROM LESSON N" label
  lessonNumber: number;
}

// No countdown: warm-ups have no time limit, and a ticking clock that turns
// red and then does nothing only adds pressure.
// Warm-ups advance like any other step: when the kid's code in the editor
// passes the step's validator (see LessonPage handleCodeChange).
export default function WarmUpStep({ bytePrompt, instruction, lessonNumber }: WarmUpStepProps) {
  return (
    <div className="relative flex flex-col h-full pt-4 md:pt-0 px-6 pb-6 gap-6 overflow-y-auto">
      {/* Warm-up Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ background: '#FEF0D6', border: '2px solid #D4581A' }}
      >
        <span className="text-2xl" aria-hidden="true">⚡</span>
        <div>
          <div className="font-black uppercase text-sm tracking-[0.08em]" style={{ color: '#A8430F' }}>WARM-UP!</div>
          <div className="text-xs mt-0.5" style={{ color: '#854F0B' }}>No hearts at risk</div>
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
          <ByteTypewriter text={bytePrompt} mood="idle" />
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
            color: '#A8430F',
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
