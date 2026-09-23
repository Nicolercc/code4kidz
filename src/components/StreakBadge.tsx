import { useGameStore } from '../store/gameStore';

export default function StreakBadge() {
  const streak = useGameStore((s) => s.streak);

  return (
    <div className="flex items-center gap-2 bg-brand-purpleP text-brand-purple font-bold px-3 py-1.5 rounded-full border border-brand-purple/20">
      <span className="text-xl">{streak > 0 ? '🔥' : '🧊'}</span>
      <span className="text-lg">{streak} Day Streak</span>
    </div>
  );
}