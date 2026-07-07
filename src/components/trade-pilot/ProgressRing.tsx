import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  toneClass?: string;
  showLabel?: boolean;
  className?: string;
}

/** SVG circular progress indicator with a centred mono % label.
 *  Geometry is driven by SVG attributes (not inline CSS). */
export function ProgressRing({
  value,
  size = 44,
  stroke = 4,
  toneClass = 'stroke-teal-500',
  showLabel = true,
  className,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span
      className={cn('relative inline-flex items-center justify-center', className)}
      role="img"
      aria-label={`${Math.round(clamped)}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-gray-150"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={cn('transition-all duration-300', toneClass)}
        />
      </svg>
      {showLabel && (
        <span className="absolute font-mono text-[11px] font-semibold tabular-nums text-foreground">
          {Math.round(clamped)}%
        </span>
      )}
    </span>
  );
}
