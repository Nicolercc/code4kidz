import { motion } from 'framer-motion';
import { lastSevenDays, localDateKey } from '../lesson/streak';

/**
 * The last seven days as dots: green for today if practised, purple for other
 * practised days, an orange pulsing ring if today still needs practice.
 * The dots are decorative; the summary sentence is what screen readers get.
 */
export default function StreakCalendar({ playedDates }: { playedDates: readonly string[] }) {
  const days = lastSevenDays();
  const today = localDateKey();
  const played = new Set(playedDates);
  const practisedCount = days.filter((d) => played.has(d.key)).length;

  return (
    <div>
      <p className="sr-only">
        You practised on {practisedCount} of the last 7 days{played.has(today) ? ', including today' : ''}.
      </p>
      <div aria-hidden="true">
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
          {days.map((d) => {
            const isToday = d.key === today;
            const didPlay = played.has(d.key);
            const needsToday = isToday && !didPlay;
            return (
              <motion.div
                key={d.key}
                animate={needsToday ? { boxShadow: ['0 0 0 0 rgba(212,88,26,0)', '0 0 0 8px rgba(212,88,26,0.25)', '0 0 0 0 rgba(212,88,26,0)'] } : {}}
                transition={needsToday ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : {}}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: didPlay ? (isToday ? '#1A7A4E' : '#5C3EBC') : 'rgba(255,255,255,0.1)',
                  border: needsToday ? '2px solid rgba(212,88,26,0.9)' : '2px solid rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: 14,
                }}
              >
                {didPlay ? '✓' : ''}
              </motion.div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          {days.map((d) => (
            <div key={`${d.key}-label`} style={{ width: 28, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>
              {d.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
