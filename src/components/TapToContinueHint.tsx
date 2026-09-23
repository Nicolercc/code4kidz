import { motion } from 'framer-motion';

/** Bottom-right: › Tap to continue — 13px, weight 600, accent color. Opacity pulse 0.4→1→0.4 (or stronger when bar complete). */
export default function TapToContinueHint({
  accentColor,
  pulseStrength = 'normal',
  visible = true,
}: {
  accentColor: string;
  pulseStrength?: 'normal' | 'strong';
  visible?: boolean;
}) {
  if (!visible) return null;

  // Framer Motion keyframes expect a mutable array; `as const` makes this a readonly tuple.
  const opacityRange: number[] =
    pulseStrength === 'strong' ? [0.15, 1, 0.15] : [0.4, 1, 0.4];

  return (
    <motion.span
      aria-label="Press space or tap to continue"
      animate={{ opacity: opacityRange }}
      transition={{ duration: pulseStrength === 'strong' ? 0.9 : 1.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        right: 12,
        bottom: 10,
        fontSize: 13,
        fontWeight: 600,
        color: accentColor,
        userSelect: 'none',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span aria-hidden>›</span>
      <span>Tap to continue</span>
    </motion.span>
  );
}
