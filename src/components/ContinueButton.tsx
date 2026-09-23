import { forwardRef, type MouseEvent } from 'react';

interface ContinueButtonProps {
  accentColor: string;
  onClick: (e: MouseEvent) => void;
}

/**
 * The visible, focusable way to continue past a message. Pointer users can
 * still tap anywhere on the surrounding area (see useTapGate).
 */
const ContinueButton = forwardRef<HTMLButtonElement, ContinueButtonProps>(function ContinueButton(
  { accentColor, onClick },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="continue-pulse inline-flex items-center gap-1.5 rounded-full font-bold text-base"
      style={{ padding: '10px 22px', minHeight: 44, color: accentColor, border: `2px solid ${accentColor}`, background: 'transparent' }}
    >
      Continue <span aria-hidden="true">›</span>
    </button>
  );
});

export default ContinueButton;
