import { cn } from '@/lib/utils';

interface MoneyProps {
  value: number;
  className?: string;
}

/** GBP amount in mono tabular figures, per the design's numeral rule. */
export function Money({ value, className }: MoneyProps) {
  return (
    <span className={cn('font-mono tabular-nums tracking-tight', className)}>
      £{Number(value).toLocaleString('en-GB')}
    </span>
  );
}
