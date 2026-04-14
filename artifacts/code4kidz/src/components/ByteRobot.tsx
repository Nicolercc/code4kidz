import { motion } from 'framer-motion';

interface ByteRobotProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function ByteRobot({ size = 200, className = '', animate = true }: ByteRobotProps) {
  const floatAnim = animate ? {
    y: [0, -12, 0],
    rotate: [-2, 2, -2],
  } : {};
  const floatTransition = animate ? {
    duration: 3.5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  } : {};

  return (
    <motion.div
      className={className}
      animate={floatAnim}
      transition={floatTransition}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
      >
        {/* Shadow */}
        <ellipse cx="100" cy="210" rx="50" ry="8" fill="rgba(0,0,0,0.15)" />

        {/* Antenna stem */}
        <rect x="96" y="18" width="8" height="22" rx="4" fill="#2DB87A" />
        {/* Antenna ball */}
        <circle cx="100" cy="14" r="10" fill="#FFD966" />
        <circle cx="100" cy="14" r="6" fill="#FFC400" />
        <circle cx="97" cy="11" r="2" fill="rgba(255,255,255,0.6)" />

        {/* Head */}
        <rect x="42" y="36" width="116" height="82" rx="28" fill="#2DB87A" />
        {/* Head highlight */}
        <rect x="52" y="42" width="60" height="22" rx="11" fill="rgba(255,255,255,0.12)" />

        {/* Left eye */}
        <rect x="56" y="54" width="32" height="28" rx="14" fill="white" />
        <rect x="60" y="57" width="24" height="20" rx="10" fill="#1A1A2E" />
        <circle cx="72" cy="67" r="4" fill="white" />
        <circle cx="79" cy="61" r="2" fill="white" />

        {/* Right eye */}
        <rect x="112" y="54" width="32" height="28" rx="14" fill="white" />
        <rect x="116" y="57" width="24" height="20" rx="10" fill="#1A1A2E" />
        <circle cx="128" cy="67" r="4" fill="white" />
        <circle cx="135" cy="61" r="2" fill="white" />

        {/* Smile */}
        <path
          d="M78 92 Q100 108 122 92"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cheek blush left */}
        <ellipse cx="58" cy="90" rx="10" ry="6" fill="rgba(255,120,100,0.3)" />
        {/* Cheek blush right */}
        <ellipse cx="142" cy="90" rx="10" ry="6" fill="rgba(255,120,100,0.3)" />

        {/* Neck */}
        <rect x="86" y="116" width="28" height="10" rx="5" fill="#25A36B" />

        {/* Body */}
        <rect x="30" y="124" width="140" height="76" rx="24" fill="#25A36B" />
        {/* Body highlight */}
        <rect x="40" y="130" width="80" height="16" rx="8" fill="rgba(255,255,255,0.1)" />

        {/* Chest panel */}
        <rect x="58" y="140" width="84" height="46" rx="14" fill="#1E9460" />
        {/* Dots on chest */}
        <circle cx="81" cy="163" r="7" fill="#FFD966" />
        <circle cx="100" cy="163" r="7" fill="#4AE8A0" />
        <circle cx="119" cy="163" r="7" fill="#FF8C69" />
        {/* Dot shine */}
        <circle cx="78" cy="160" r="2.5" fill="rgba(255,255,255,0.7)" />
        <circle cx="97" cy="160" r="2.5" fill="rgba(255,255,255,0.7)" />
        <circle cx="116" cy="160" r="2.5" fill="rgba(255,255,255,0.7)" />

        {/* Left arm */}
        <rect x="4" y="130" width="28" height="50" rx="14" fill="#2DB87A" />
        <circle cx="18" cy="186" r="14" fill="#25A36B" />

        {/* Right arm */}
        <rect x="168" y="130" width="28" height="50" rx="14" fill="#2DB87A" />
        <circle cx="182" cy="186" r="14" fill="#25A36B" />

        {/* Left foot */}
        <rect x="54" y="194" width="38" height="20" rx="10" fill="#1E9460" />
        {/* Right foot */}
        <rect x="108" y="194" width="38" height="20" rx="10" fill="#1E9460" />
      </svg>
    </motion.div>
  );
}
