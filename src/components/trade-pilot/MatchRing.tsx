import { cn } from '@/lib/utils';
import { ProgressRing } from './ProgressRing';

interface MatchRingProps {
  value: number;
  size?: number;
  className?: string;
}

/** Job match-score ring — colour steps with the score. */
export function MatchRing({ value, size = 44, className }: MatchRingProps) {
  const toneClass =
    value >= 85
      ? 'stroke-green-500'
      : value >= 70
        ? 'stroke-teal-500'
        : 'stroke-gray-400';
  return (
    <ProgressRing
      value={value}
      size={size}
      toneClass={toneClass}
      className={cn('shrink-0', className)}
    />
  );
}
