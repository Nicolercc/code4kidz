import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function HeartBar() {
  const hearts = useGameStore((s) => s.hearts);
  const [prevHearts, setPrevHearts] = useState(hearts);
  const [showFlash, setShowFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeRef = useRef<number>(0);

  useEffect(() => {
    if (hearts < prevHearts) {
      shakeRef.current += 1;
      if (hearts === 0) {
        setShowFlash(true);
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setShowFlash(false), 700);
      }
    }
    setPrevHearts(hearts);
  }, [hearts, prevHearts]);

  return (
    <>
      <motion.div
        key={shakeRef.current}
        animate={hearts < prevHearts ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-brand-border"
      >
        {[1, 2, 3].map((i) => {
          const isLost = i > hearts;
          return (
            <div key={i} className="relative">
              <motion.div
                initial={false}
                animate={isLost
                  ? { scale: [1, 1.3, 0.9], opacity: [1, 1, 0.5] }
                  : { scale: 1, opacity: 1 }
                }
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-2xl"
              >
                {isLost ? '💔' : '❤️'}
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Full-viewport red flash on 0 hearts */}
      {createPortal(
        <AnimatePresence>
          {showFlash && (
            <motion.div
              className="fixed inset-0 pointer-events-none z-[9999]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.18, 0] }}
              transition={{ duration: 0.65, times: [0, 0.3, 1] }}
              style={{ background: '#dc2626' }}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
