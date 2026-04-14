import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import TapToContinueHint from './TapToContinueHint';
import { useTapGate } from '../hooks/useTapGate';
import { speak } from '../utils/voice';

interface HintButtonProps {
  hint: string;
  isVisible: boolean;
  isStuck?: boolean;
}

function HintRevealPanel({ hint }: { hint: string }) {
  const gate = useTapGate(() => {}, hint, true);

  useEffect(() => {
    speak(hint);
  }, [hint]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mt-3"
    >
      <div
        {...gate.containerProps}
        className="relative p-4 bg-brand-orangeL rounded-xl border border-brand-orange/30 text-brand-dark font-medium whitespace-pre-wrap text-sm leading-relaxed"
        style={{ paddingBottom: gate.indicatorVisible ? 40 : 16, minHeight: 44 }}
      >
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {gate.announce}
        </span>
        {hint}
        {gate.indicatorVisible && <TapToContinueHint accentColor="#D4581A" />}
      </div>
    </motion.div>
  );
}

export default function HintButton({ hint, isVisible, isStuck = false }: HintButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <motion.button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-full relative overflow-visible"
            style={{ background: '#FEF0D6', color: '#D4581A', border: '2px solid #D4581A', minHeight: 44 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            animate={isStuck ? {
              boxShadow: [
                '0 0 0 0 rgba(212,88,26,0)',
                '0 0 0 8px rgba(212,88,26,0.35)',
                '0 0 0 0 rgba(212,88,26,0)',
              ],
            } : { boxShadow: '0 0 0 0 rgba(212,88,26,0)' }}
            transition={isStuck ? { duration: 1.5, repeat: Infinity } : {}}
          >
            <span>💡</span> Need a hint?
          </motion.button>

          <AnimatePresence>
            {isOpen && <HintRevealPanel key={hint} hint={hint} />}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
