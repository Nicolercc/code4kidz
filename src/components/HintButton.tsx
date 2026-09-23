import { motion, AnimatePresence } from 'framer-motion';
import { useId, useState } from 'react';

interface HintButtonProps {
  hint: string;
  isVisible: boolean;
  isStuck?: boolean;
}

/**
 * A disclosure: the button says whether the hint is open (aria-expanded) and
 * which panel it controls. The panel is plain text so screen readers read the
 * hint itself. (It used to be a fake "tap to continue" button that did nothing
 * and hid the hint behind its label.)
 */
export default function HintButton({ hint, isVisible, isStuck = false }: HintButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

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
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-full relative overflow-visible"
            style={{ background: '#FEF0D6', color: '#A8430F', border: '2px solid #D4581A', minHeight: 44 }}
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
            <span aria-hidden="true">💡</span> {isOpen ? 'Hide hint' : 'Need a hint?'}
          </motion.button>

          <div id={panelId} hidden={!isOpen}>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mt-3"
                >
                  <div className="p-4 bg-brand-orangeL rounded-xl border border-brand-orange/30 text-brand-dark font-medium whitespace-pre-wrap text-sm leading-relaxed">
                    {hint}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
