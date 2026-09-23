export type BubbleMood = 'idle' | 'cheer' | 'think' | 'sad' | 'story';

const BUBBLE_STYLE: Record<BubbleMood, { bg: string; borderColor: string; text: string; borderW: string }> = {
  idle:  { bg: 'white',   borderColor: '#5C3EBC', text: '#1A1A2E', borderW: '3px' },
  cheer: { bg: '#D6F5E8', borderColor: '#1A7A4E', text: '#0F5C38', borderW: '4px' },
  think: { bg: '#FEF0D6', borderColor: '#D4581A', text: '#7A3A0A', borderW: '3px' },
  sad:   { bg: '#FDECE6', borderColor: '#B33A1C', text: '#7A1A0A', borderW: '3px' },
  story: { bg: '#FAE8F3', borderColor: '#8C2060', text: '#5C0A3A', borderW: '4px' },
};

export interface ByteTypewriterProps {
  text: string;
  mood: BubbleMood;
  /** Tighter typography for side panels (e.g. lesson) so content fits without scrolling. */
  compact?: boolean;
  /**
   * Make this bubble the screen's status channel: screen readers announce each
   * new message politely. Use for at most one bubble per screen.
   */
  live?: boolean;
}

/** Byte's speech bubble. Colour and border signal the mood; the text carries the meaning. */
export default function ByteTypewriter({ text, mood, compact = false, live = false }: ByteTypewriterProps) {
  const b = BUBBLE_STYLE[mood];

  return (
    <div
      {...(live ? { role: 'status', 'aria-atomic': true } : {})}
      style={{
        background: b.bg,
        borderLeft: `${b.borderW} solid ${b.borderColor}`,
        borderRadius: 12,
        padding: compact ? '10px 14px' : '14px 16px',
        fontSize: compact ? 14 : 16,
        lineHeight: compact ? 1.5 : 1.6,
        color: b.text,
        fontWeight: 500,
        position: 'relative',
      }}
    >
      {mood === 'story' && (
        <span
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 900,
            color: b.borderColor,
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Byte&apos;s Story
        </span>
      )}
      {/* The green "cheer" bubble means a step just passed; say so in words too. */}
      {live && mood === 'cheer' && text && <span className="sr-only">Correct! </span>}
      <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
    </div>
  );
}
