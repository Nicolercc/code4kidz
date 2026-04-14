import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  const prevStep = useRef(currentStep);
  useEffect(() => { prevStep.current = currentStep; }, [currentStep]);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-bold text-brand-muted uppercase tracking-wider">
        Step {Math.max(1, currentStep)} of {totalSteps}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isPast = stepNum < currentStep;
          const justCompleted = stepNum === currentStep - 1 && prevStep.current === currentStep - 1;
          
          return (
            <div key={stepNum} className="flex-1 h-3 bg-white/50 rounded-full overflow-hidden border border-brand-border/50">
              {isPast && (
                <motion.div
                  className="h-full bg-brand-green"
                  initial={justCompleted ? { width: '0%', boxShadow: '0 0 0px rgba(26,122,78,0)' } : { width: '100%' }}
                  animate={{ width: '100%', boxShadow: ['0 0 0px rgba(26,122,78,0)', '0 0 10px rgba(26,122,78,0.55)', '0 0 0px rgba(26,122,78,0)'] }}
                  transition={justCompleted
                    ? { width: { duration: 0.4, ease: 'linear' }, boxShadow: { duration: 0.6 } }
                    : { duration: 0 }
                  }
                />
              )}
              {isActive && (
                <motion.div
                  layoutId="activeStep"
                  className="w-full h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, rgba(92,62,188,0.75), rgba(155,114,240,1), rgba(92,62,188,0.75))',
                    backgroundSize: '200% 100%',
                  }}
                  initial={{ x: 12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ x: { duration: 0.3 }, opacity: { duration: 0.3 }, backgroundPosition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}