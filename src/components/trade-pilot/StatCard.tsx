import { ReactNode } from 'react';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionLabel } from './SectionLabel';
import { Tone, toneChip } from './tones';

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  delta?: { direction: 'up' | 'down'; value: string };
  badge?: ReactNode;
  onClick?: () => void;
  /** Replaces the icon chip (e.g. a ProgressRing). */
  children?: ReactNode;
  className?: string;
}

/** Dashboard KPI tile: overline label, big mono value, icon chip, delta pill. */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'brand',
  delta,
  badge,
  onClick,
  children,
  className,
}: StatCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'rounded-xl border bg-card p-5 shadow-xs transition-all',
        onClick &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <SectionLabel>{label}</SectionLabel>
        {badge}
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
              delta.direction === 'up'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            )}
          >
            {delta.direction === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="font-mono tabular-nums">{delta.value}</span>
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-display font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        {children ??
          (Icon && (
            <span
              className={cn(
                'inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg',
                toneChip[tone]
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
          ))}
      </div>
    </div>
  );
}
