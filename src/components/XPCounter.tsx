import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useEffect, useRef, useState } from 'react';
import { play } from '../utils/sounds';

export default function XPCounter() {
  const xp = useGameStore((s) => s.xp);
  const [displayXp, setDisplayXp] = useState(xp);
  const prevTargetRef = useRef(xp);
  const [pop, setPop] = useState<{ amount: number; id: number } | null>(null);
  const [isGlowing, setIsGlowing] = useState(false);
  const glowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const prevTarget = prevTargetRef.current;
    if (xp > prevTarget) {
      const gained = xp - prevTarget;
      setPop({ amount: gained, id: Date.now() });
      prevTargetRef.current = xp;

      setIsGlowing(true);
      if (glowTimer.current) clearTimeout(glowTimer.current);
      glowTimer.current = setTimeout(() => setIsGlowing(false), 900);
      timers.push(setTimeout(() => setPop(null), 2000));

      // Count up over 800ms with tick sounds.
      if (animTimer.current) clearInterval(animTimer.current);
      const start = displayXp;
      const end = xp;
      const durationMs = 800;
      const startTs = Date.now();
      animTimer.current = setInterval(() => {
        const t = Math.min(1, (Date.now() - startTs) / durationMs);
        const next = Math.floor(start + (end - start) * t);
        setDisplayXp((cur) => {
          if (next > cur) {
            // one click per number tick
            for (let i = cur + 1; i <= next; i++) play('xpPop');
          }
          return next;
        });
        if (t >= 1) {
          if (animTimer.current) clearInterval(animTimer.current);
          animTimer.current = null;
          setDisplayXp(end);
        }
      }, 16);
    } else if (xp < prevTarget) {
      // If something resets XP (rare), snap.
      prevTargetRef.current = xp;
      setDisplayXp(xp);
    }
    return () => {
      timers.forEach(clearTimeout);
      if (animTimer.current) clearInterval(animTimer.current);
      animTimer.current = null;
    };
  }, [xp, displayXp]);

  return (
    <motion.div
      className="relative flex items-center gap-2 bg-brand-orangeL text-brand-orange font-bold px-3 py-1.5 rounded-full border-2 border-brand-orange/20"
      animate={isGlowing ? {
        boxShadow: '0 0 14px rgba(212,88,26,0.65)',
        scale: [1, 1.2, 1],
      } : {
        boxShadow: '0 0 0px rgba(212,88,26,0)',
      }}
      transition={{ duration: 0.3, times: [0, 0.5, 1] }}
    >
      <span className="text-xl">⚡</span>
      <span className="text-lg">{displayXp} XP</span>

      <AnimatePresence>
        {pop && (
          <motion.div
            key={pop.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: -32, scale: 1.0 }}
            transition={{ duration: 1.2, times: [0, 0.15, 0.7, 1] }}
            className="absolute left-1/2 -translate-x-1/2 text-brand-orange font-black text-xl drop-shadow-md pointer-events-none whitespace-nowrap"
          >
            +{pop.amount} XP
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
