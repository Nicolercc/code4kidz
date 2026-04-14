import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

const btnStyle: CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 16,
  zIndex: 50,
  background: 'rgba(255,255,255,0.15)',
  border: '1.5px solid rgba(255,255,255,0.3)',
  borderRadius: 20,
  padding: '8px 18px',
  minHeight: 44,
  color: 'white',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

interface FlowBackButtonProps {
  label?: string;
  /** If set, navigates here; otherwise uses navigate(-1). */
  to?: string;
  /** Use with `to` for completion screen — always land on map. */
  replace?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function FlowBackButton({ label = '← Back', to, replace, className, style }: FlowBackButtonProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={className}
      style={{ ...btnStyle, ...style }}
      aria-label={label === '← Map' ? 'Go to map' : 'Go back to previous screen'}
      onClick={(e) => {
        e.stopPropagation();
        if (to) navigate(to, { replace: !!replace });
        else navigate(-1);
      }}
    >
      {label}
    </button>
  );
}
