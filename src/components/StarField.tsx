import { useEffect, useRef, useState } from 'react';

/**
 * Decorative night sky behind the map: twinkling stars, two nebula glows with
 * a gentle mouse parallax, and an occasional shooting star.
 *
 * Parallax writes CSS variables on one element instead of React state, so a
 * mouse move costs no re-render. (It used to re-render the whole map, and
 * because this was defined inside MapPage, every star remounted on each move.)
 * Motion stops entirely for learners who prefer reduced motion.
 */
export default function StarField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [stars] = useState(() => generateStars(120));
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        rootRef.current?.style.setProperty('--px', String((e.clientX / window.innerWidth - 0.5) * 20));
        rootRef.current?.style.setProperty('--py', String((e.clientY / window.innerHeight - 0.5) * 20));
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', handleMove);
    };
  }, [reducedMotion]);

  const [shootingStar, setShootingStar] = useState<null | { x: number; y: number; id: number }>(null);
  useEffect(() => {
    if (reducedMotion) return;
    const fireShootingStar = () => {
      const startX = Math.random() < 0.5
        ? Math.random() * 40
        : Math.random() * 15;
      const startY = startX > 15 ? 0 : Math.random() * 60;

      const id = Date.now();
      setShootingStar({ x: startX, y: startY, id });
      window.setTimeout(() => setShootingStar(null), 1200);
    };

    const interval = window.setInterval(
      fireShootingStar,
      12000 + Math.random() * 6000
    );
    return () => window.clearInterval(interval);
  }, [reducedMotion]);


  return (
    <div ref={rootRef} aria-hidden="true" className="map-stars">
    <>
      {/* Nebula orbs (behind stars) */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: -100,
          right: -80,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(92,62,188,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: -1,
          transform: 'translate(calc(var(--px, 0) * 0.5px), calc(var(--py, 0) * 0.5px))',
          transition: 'transform 0.8s ease-out',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: -120,
          left: -100,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,124,123,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: -1,
          transform: 'translate(calc(var(--px, 0) * -0.4px), calc(var(--py, 0) * -0.4px))',
          transition: 'transform 0.8s ease-out',
        }}
      />

      {/* Stars */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          transform: 'translate(calc(var(--px, 0) * 0.3px), calc(var(--py, 0) * 0.3px))',
          transition: 'transform 0.8s ease-out',
        }}
      >
        {stars.map((star, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              background: star.color,
              opacity: star.baseOpacity,
              animationName: star.animClass,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              pointerEvents: 'none',
            }}
          />
        ))}

        {HERO_STARS.map((s, i) => (
          <div
            key={`hero-${i}`}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: s.color,
              opacity: s.opacity,
              animationName: 'starTwinkleBright',
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              pointerEvents: 'none',
            }}
          />
        ))}

        {shootingStar && (
          <div
            key={shootingStar.id}
            style={{
              position: 'fixed',
              left: `${shootingStar.x}%`,
              top: `${shootingStar.y}%`,
              width: 80,
              height: 2,
              borderRadius: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
              animation: 'shootingStar 1.2s ease-out forwards',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}
      </div>
    </>
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

const HERO_STARS = [
      { x: 4,  y: 8,  size: 4,   opacity: 1,    color: 'rgba(255,255,255,1)', duration: 3.2, delay: 0 },
      { x: 8,  y: 4,  size: 2.5, opacity: 0.8,  color: 'rgba(200,180,255,1)', duration: 4.1, delay: 1.2 },
      { x: 2,  y: 18, size: 2,   opacity: 0.6,  color: 'rgba(255,255,255,1)', duration: 5.0, delay: 0.5 },
      { x: 92, y: 6,  size: 3.5, opacity: 1,    color: 'rgba(255,240,180,1)', duration: 2.8, delay: 2.0 }, // warm
      { x: 96, y: 14, size: 2,   opacity: 0.7,  color: 'rgba(255,255,255,1)', duration: 4.5, delay: 0.8 },
      { x: 6,  y: 88, size: 3,   opacity: 0.9,  color: 'rgba(180,220,255,1)', duration: 3.8, delay: 1.5 },
      { x: 12, y: 94, size: 2,   opacity: 0.6,  color: 'rgba(255,255,255,1)', duration: 5.2, delay: 3.0 },
      { x: 88, y: 90, size: 4,   opacity: 1,    color: 'rgba(255,255,255,1)', duration: 2.5, delay: 0.3 },
      { x: 94, y: 82, size: 2.5, opacity: 0.8,  color: 'rgba(200,180,255,1)', duration: 3.9, delay: 1.8 },
      { x: 3,  y: 45, size: 3,   opacity: 0.85, color: 'rgba(255,255,255,1)', duration: 4.0, delay: 2.5 },
      { x: 97, y: 52, size: 2.5, opacity: 0.75, color: 'rgba(180,160,255,1)', duration: 3.5, delay: 1.0 },
    ];

function generateStars(count: number) {
  return Array.from({ length: count }, () => {
    // Edge-weighted placement
    const zone = Math.random();
    let x: number;
    let y: number;

    if (zone < 0.75) {
      // 75% EDGE ZONE (left 20%, right 20%, top 15%, bottom 15%)
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) {
        x = Math.random() * 20;
        y = Math.random() * 100;
      } else if (edge === 1) {
        x = 80 + Math.random() * 20;
        y = Math.random() * 100;
      } else if (edge === 2) {
        x = Math.random() * 100;
        y = Math.random() * 15;
      } else {
        x = Math.random() * 100;
        y = 85 + Math.random() * 15;
      }
    } else {
      // 25% CENTER ZONE (sparse, dim)
      x = 20 + Math.random() * 60;
      y = 15 + Math.random() * 70;
    }

    const isEdge = zone < 0.75;
    const size = isEdge
      ? (Math.random() < 0.15 ? 3 : Math.random() < 0.4 ? 2.5 : 2)
      : (Math.random() < 0.05 ? 2 : 1.5);

    const baseOpacity = isEdge
      ? (size === 3 ? 0.95 : size === 2.5 ? 0.75 : 0.5)
      : 0.15;

    const colorRoll = Math.random();
    const color = colorRoll < 0.08
      ? 'rgba(255,220,100,1)'
      : colorRoll < 0.25
        ? 'rgba(180,160,255,1)'
        : 'rgba(255,255,255,1)';

    const duration = isEdge
      ? 2 + Math.random() * 5
      : 5 + Math.random() * 8;

    const delay = Math.random() * 8;

    const animClass = baseOpacity > 0.7
      ? 'starTwinkleBright'
      : baseOpacity > 0.4
        ? 'starTwinkleMid'
        : 'starTwinkleDim';

    return { x, y, size, baseOpacity, color, duration, delay, animClass };
  });
}
