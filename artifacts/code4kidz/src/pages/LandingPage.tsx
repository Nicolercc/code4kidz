import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Byte from '../components/Byte';

const NAV_LINKS = ['Home', 'Learn', 'Classroom'];

const FEATURES = [
  {
    icon: '🖥️',
    bg: 'bg-teal-50',
    iconBg: 'bg-kidz-teal',
    title: 'Live Code Editor',
    desc: 'Type real HTML & CSS and see it come alive instantly in the preview panel!',
  },
  {
    icon: '🏆',
    bg: 'bg-yellow-50',
    iconBg: 'bg-kidz-yellow',
    title: 'Earn XP & Level Up',
    desc: 'Complete lessons, earn stars, and watch your robot Byte evolve into a superhero!',
  },
  {
    icon: '❤️',
    bg: 'bg-pink-50',
    iconBg: 'bg-kidz-pink',
    title: 'Hearts System',
    desc: 'You get 5 hearts per session. Make mistakes? No worries — Byte helps you fix them!',
  },
  {
    icon: '🔥',
    bg: 'bg-orange-50',
    iconBg: 'bg-kidz-coral',
    title: 'Daily Streaks',
    desc: 'Code every day to keep your streak alive. Consistency builds coding superpowers!',
  },
  {
    icon: '👥',
    bg: 'bg-purple-50',
    iconBg: 'bg-kidz-purple',
    title: 'Classroom Mode',
    desc: 'Teachers can track progress, assign lessons, and cheer on their class in real time.',
  },
  {
    icon: '🔒',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-400',
    title: 'Kid-Safe Platform',
    desc: 'No ads, no social feeds, no distractions. Just pure learning fun for young coders.',
  },
];

const LESSON_NODES = [
  { num: 1, title: 'Hello, World!', xp: '+100 XP', done: true },
  { num: 2, title: 'Making Headings', xp: '+120 XP', done: true },
  { num: 3, title: 'Adding Colors', xp: '+150 XP', done: false, current: true },
  { num: 4, title: '???', xp: '', done: false, locked: true },
  { num: 5, title: '???', xp: '', done: false, locked: true },
  { num: 6, title: '???', xp: '', done: false, locked: true },
];

const BYTE_EVOLUTIONS = [
  { level: 'Lv.1', label: 'Rusty Bot', color: 'text-gray-400' },
  { level: 'Lv.2', label: 'Blue Spark', color: 'text-blue-400' },
  { level: 'Lv.3', label: 'Byte Pro', color: 'text-green-400' },
  { level: 'Lv.5', label: 'Super Byte', color: 'text-kidz-yellow' },
];

// ── Animated hero background ──────────────────────────────────────────────────
const ORBS = [
  { x: '4%',  y: '20%', size: 240, color: '#00D9C0', opacity: 0.18, delay: 0,   dur: 7 },
  { x: '78%', y: '8%',  size: 180, color: '#FFD93D', opacity: 0.16, delay: 1.2, dur: 8 },
  { x: '88%', y: '68%', size: 200, color: '#8B5CF6', opacity: 0.18, delay: 0.5, dur: 9 },
  { x: '10%', y: '72%', size: 150, color: '#FF6B9D', opacity: 0.16, delay: 2,   dur: 6 },
  { x: '48%', y: '5%',  size: 100, color: '#00D9C0', opacity: 0.12, delay: 0.8, dur: 7.5 },
];

// Small floating shapes: type, position, size, color, delay, duration, rotate
const FLOAT_SHAPES = [
  { type: 'star4',    x: '17%', y: '10%', size: 28, color: '#FFD93D', delay: 0,   dur: 3.8, rot: 0 },
  { type: 'star4',    x: '63%', y: '82%', size: 22, color: '#00D9C0', delay: 1.5, dur: 4.2, rot: 45 },
  { type: 'star4',    x: '91%', y: '28%', size: 18, color: '#FF6B9D', delay: 0.7, dur: 3.5, rot: 20 },
  { type: 'circle',   x: '74%', y: '18%', size: 14, color: '#FF6B9D', delay: 0.4, dur: 3.2, rot: 0 },
  { type: 'circle',   x: '28%', y: '78%', size: 18, color: '#8B5CF6', delay: 1.8, dur: 4.5, rot: 0 },
  { type: 'circle',   x: '53%', y: '12%', size: 10, color: '#FFD93D', delay: 0.9, dur: 3.0, rot: 0 },
  { type: 'circle',   x: '6%',  y: '48%', size: 12, color: '#00D9C0', delay: 2.2, dur: 5.0, rot: 0 },
  { type: 'diamond',  x: '88%', y: '44%', size: 22, color: '#00D9C0', delay: 1.1, dur: 4.8, rot: 45 },
  { type: 'diamond',  x: '35%', y: '88%', size: 16, color: '#FFD93D', delay: 0.3, dur: 3.6, rot: 45 },
  { type: 'triangle', x: '60%', y: '5%',  size: 20, color: '#8B5CF6', delay: 2.5, dur: 5.2, rot: 0 },
  { type: 'triangle', x: '8%',  y: '35%', size: 16, color: '#FF6B9D', delay: 0.6, dur: 3.4, rot: 180 },
  { type: 'sparkle',  x: '42%', y: '22%', size: 22, color: '#ffffff', delay: 0.2, dur: 2.8, rot: 0 },
  { type: 'sparkle',  x: '82%', y: '58%', size: 18, color: '#FFD93D', delay: 1.6, dur: 3.1, rot: 15 },
  { type: 'sparkle',  x: '14%', y: '62%', size: 16, color: '#00D9C0', delay: 0.9, dur: 2.6, rot: 30 },
  { type: 'sparkle',  x: '70%', y: '72%', size: 14, color: '#FF6B9D', delay: 2.1, dur: 3.3, rot: 10 },
  { type: 'plus',     x: '48%', y: '75%', size: 18, color: '#8B5CF6', delay: 1.3, dur: 4.0, rot: 0 },
  { type: 'plus',     x: '23%', y: '22%', size: 14, color: '#FFD93D', delay: 2.8, dur: 3.7, rot: 45 },
];

function ShapeEl({ type, size, color }: { type: string; size: number; color: string }) {
  if (type === 'circle') {
    return <div style={{ width: size, height: size, borderRadius: '50%', background: color }} />;
  }
  if (type === 'diamond') {
    return (
      <div style={{
        width: size, height: size, background: color,
        transform: 'rotate(45deg)', borderRadius: 3,
      }} />
    );
  }
  if (type === 'triangle') {
    return (
      <div style={{
        width: 0, height: 0,
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid ${color}`,
      }} />
    );
  }
  if (type === 'star4') {
    // Four-pointed star using text ✦
    return <span style={{ fontSize: size, color, lineHeight: 1 }}>✦</span>;
  }
  if (type === 'sparkle') {
    return <span style={{ fontSize: size, color, lineHeight: 1 }}>✨</span>;
  }
  if (type === 'plus') {
    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <div style={{ position: 'absolute', top: '35%', left: 0, width: '100%', height: '30%', background: color, borderRadius: 4 }} />
        <div style={{ position: 'absolute', left: '35%', top: 0, height: '100%', width: '30%', background: color, borderRadius: 4 }} />
      </div>
    );
  }
  return null;
}

function AnimatedHeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Blurred colour orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            left: orb.x, top: orb.y,
            width: orb.size, height: orb.size,
            background: orb.color,
            opacity: orb.opacity,
            filter: 'blur(70px)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.25, 1], opacity: [orb.opacity, orb.opacity * 1.6, orb.opacity] }}
          transition={{ duration: orb.dur, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Floating geometric shapes */}
      {FLOAT_SHAPES.map((s, i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute"
          style={{ left: s.x, top: s.y, transform: 'translate(-50%, -50%)' }}
          animate={{ y: [0, -14, 0], rotate: [s.rot, s.rot + 12, s.rot], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        >
          <ShapeEl type={s.type} size={s.size} color={s.color} />
        </motion.div>
      ))}
    </div>
  );
}

function FloatingBadge({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <motion.div
      className={`absolute px-3 py-1.5 rounded-full text-sm font-bold shadow-lg font-poppins ${className}`}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function EvoByte({ size, mood }: { size: number; mood: 'idle' | 'cheer' }) {
  return <Byte mood={mood} size={size} showSpeech={false} />;
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-quicksand">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🌱</span>
            </div>
            <span className="font-poppins font-black text-lg text-brand-purple hidden sm:block">Code4Kidz</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 flex-1">
            {NAV_LINKS.map((link, i) => {
              const isClassroom = i === 2;
              return (
                <div key={link} className="relative group">
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-semibold font-poppins transition-colors ${
                      i === 0 ? 'bg-brand-purpleP text-brand-purple' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    style={isClassroom ? { opacity: 0.4, pointerEvents: 'none', cursor: 'not-allowed' } : undefined}
                    tabIndex={isClassroom ? -1 : undefined}
                  >
                    {i === 0 ? '🏠 ' : i === 1 ? '📖 ' : '🎓 '}{link}
                  </button>
                  {isClassroom && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block whitespace-nowrap bg-gray-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg pointer-events-none z-50 shadow-lg">
                      Coming soon!
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate('/onboarding')}
              className="px-4 py-2 rounded-full text-sm font-black font-poppins bg-brand-orange text-white shadow-[0_4px_0_#A84310] hover:shadow-[0_2px_0_#A84310] hover:translate-y-0.5 active:shadow-none active:translate-y-1 transition-all"
            >
              🚀 Start Learning Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-[#2A0B6B] via-[#4B1FA0] to-[#6B3FCC] min-h-[620px] flex items-center overflow-visible">
        <AnimatedHeroBg />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 w-full flex flex-col lg:flex-row items-center gap-10">

          {/* Left: copy */}
          <div className="flex-1 text-white">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold font-poppins mb-6"
            >
              🎮 Gamified Coding for Ages 7–10
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-6xl font-black leading-tight mb-2 font-poppins"
            >
              Learn to Code.
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl lg:text-6xl font-black leading-tight text-kidz-teal mb-4 font-poppins"
            >
              Level Up. Have Fun!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-white/80 text-lg max-w-md mb-8 leading-relaxed font-quicksand"
            >
              Real HTML and CSS. Free forever. No account needed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-col items-start gap-2 mb-10"
            >
              <button
                onClick={() => navigate('/onboarding')}
                className="px-6 py-3.5 bg-brand-orange text-white font-black text-lg rounded-2xl shadow-[0_6px_0_#A84310] hover:shadow-[0_4px_0_#A84310] hover:translate-y-0.5 active:shadow-none active:translate-y-1.5 transition-all font-poppins"
              >
                🚀 Start Learning Free!
              </button>
              <button
                onClick={() => navigate('/onboarding')}
                className="text-sm font-semibold font-quicksand"
                style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'; }}
              >
                Facilitator? Learn more →
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex gap-8"
            >
              {[{ val: 'Free', label: 'Forever' }, { val: 'Ages', label: '7–10' }, { val: 'Real', label: 'HTML & CSS' }].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-kidz-teal font-poppins">{s.val}</div>
                  <div className="text-white/60 text-xs font-medium font-quicksand">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Byte mascot — slides in from right */}
          <motion.div
            className="relative flex-shrink-0 flex flex-col items-center"
            initial={{ opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.4 }}
          >
            {/* Floating XP / hearts badges */}
            <FloatingBadge className="bg-kidz-yellow text-yellow-900 -top-2 -right-2 z-20">
              +100 XP! 🌟
            </FloatingBadge>
            <FloatingBadge className="bg-kidz-pink text-white bottom-12 -left-8 z-20">
              ❤️ ×5
            </FloatingBadge>

            {/* Teal glow behind Byte */}
            <div
              className="absolute rounded-full blur-3xl"
              style={{ width: 260, height: 260, background: '#00D9C0', opacity: 0.18, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />

            {/* Byte floating up/down */}
            <motion.div
              style={{ paddingTop: 90 }}
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Byte mood="idle" size={280} showSpeech onSpeechContinue={() => {}} />
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3 font-poppins">
              Why Kids <span className="text-kidz-purple">Love</span> Code4Kidz
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto font-quicksand">
              We made coding feel like the best game you've ever played — because learning should be an adventure!
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`${f.bg} rounded-2xl p-6 border border-white shadow-sm h-full`}
                >
                  <div className={`w-12 h-12 ${f.iconBg} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 font-poppins">{f.title}</h3>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEARNING PATH ── */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3 font-poppins">Your Learning Path 🗺️</h2>
            <p className="text-gray-500 text-base font-quicksand">Complete lessons in order to unlock new adventures!</p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="flex gap-4 overflow-x-auto pb-4 justify-center flex-wrap">
              {LESSON_NODES.map((node) => (
                <motion.div
                  key={node.num}
                  whileHover={!node.locked ? { y: -4, scale: 1.04 } : {}}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`relative flex-shrink-0 w-36 h-36 rounded-2xl flex flex-col items-center justify-center gap-1 p-3 text-center cursor-pointer border-2 shadow-sm
                    ${node.current ? 'bg-kidz-yellow border-yellow-300 shadow-yellow-200 shadow-md' : ''}
                    ${node.done ? 'bg-kidz-teal border-teal-300' : ''}
                    ${node.locked ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  {node.done && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-kidz-teal font-black text-base shadow border-2 border-teal-300 font-poppins">
                      ✓
                    </div>
                  )}
                  {node.locked ? (
                    <span className="text-3xl text-gray-400">🔒</span>
                  ) : (
                    <>
                      <span className="text-3xl">{node.done ? '👋' : '🎨'}</span>
                      <div className="text-white font-black text-sm leading-tight font-poppins">Lesson {node.num}</div>
                      <div className={`font-semibold text-sm font-poppins ${node.current ? 'text-yellow-900' : 'text-white'}`}>{node.title}</div>
                      {node.xp && (
                        <div className={`text-xs font-bold px-2 py-0.5 rounded-full font-poppins ${node.current ? 'bg-yellow-300/60 text-yellow-900' : 'bg-white/20 text-white'}`}>
                          {node.xp}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/onboarding')}
                className="px-8 py-4 bg-kidz-purple text-white font-black text-lg rounded-2xl shadow-[0_6px_0_#5b21b6] hover:shadow-[0_4px_0_#5b21b6] hover:translate-y-0.5 active:shadow-none transition-all flex items-center gap-3 font-poppins"
              >
                <span>▶</span> Continue Lesson 3
              </motion.button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── BYTE EVOLUTION ── */}
      <section className="py-16 mx-6 lg:mx-auto max-w-6xl">
        <FadeIn>
          <div className="bg-gradient-to-br from-[#4B1FA0] to-[#2A0B6B] rounded-3xl p-10 flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden shadow-2xl">
            <AnimatedHeroBg />

            <div className="relative z-10 flex-1">
              <h2 className="text-3xl font-black text-white mb-3 font-poppins">Watch Byte Evolve! 🤖✨</h2>
              <p className="text-white/75 text-base leading-relaxed mb-6 max-w-sm font-quicksand">
                As you earn XP and complete lessons, your robot buddy Byte transforms from a rusty little bot into a full-on superhero with a cape and visor!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 bg-kidz-yellow text-yellow-900 font-black text-base rounded-2xl shadow-[0_4px_0_#C8960C] hover:shadow-[0_2px_0_#C8960C] hover:translate-y-0.5 active:shadow-none transition-all font-poppins"
                onClick={() => navigate('/onboarding')}
              >
                See Byte's Evolution →
              </motion.button>
            </div>

            <div className="relative z-10 flex items-end gap-4 lg:gap-6">
              {BYTE_EVOLUTIONS.map((ev, i) => (
                <motion.div
                  key={ev.level}
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <EvoByte size={55 + i * 18} mood={i === 3 ? 'cheer' : 'idle'} />
                  <span className={`text-xs font-bold font-poppins ${ev.color}`}>{ev.level}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-[#0D9B8A] to-[#0D7C7B] relative overflow-hidden">
        <AnimatedHeroBg />
        <FadeIn className="relative z-10 text-center max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black text-white mb-3 font-poppins">
            Ready to Start Your Coding Adventure? 🚀
          </h2>
          <p className="text-white/80 text-lg mb-8 font-quicksand">
            Join 50,000+ kids already building amazing things with code!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/onboarding')}
            className="px-10 py-4 bg-white text-kidz-purple font-black text-xl rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.15)] hover:shadow-[0_4px_0_rgba(0,0,0,0.15)] hover:translate-y-0.5 active:shadow-none transition-all font-poppins"
          >
            🎮 Play & Learn Now — It's Free!
          </motion.button>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-kidz-navy text-gray-400 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">🌱</span>
          <span className="text-white font-black text-lg font-poppins">Code4Kidz</span>
        </div>
        <p className="text-sm font-quicksand">Making coding magical for kids ages 7–10 · Built with ❤️</p>
      </footer>
    </div>
  );
}
