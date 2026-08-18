import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tone, toneChip } from './tones';

const toneSurface: Record<string, string> = {
  brand: 'border-teal-200 bg-teal-50 dark:border-teal-500/30 dark:bg-teal-500/10',
  navy: 'border-navy-700 bg-navy-800 text-white',
  success: 'border-green-500/25 bg-green-50 dark:bg-green-500/10',
  warning: 'border-amber-500/25 bg-amber-50 dark:bg-amber-500/10',
  danger: 'border-red-500/25 bg-red-50 dark:bg-red-500/10',
  info: 'border-blue-500/25 bg-blue-50 dark:bg-blue-500/10',
  neutral: 'border-border bg-muted',
  accent: 'border-orange-500/25 bg-orange-50 dark:bg-orange-500/10',
  violet: 'border-violet-500/25 bg-violet-50 dark:bg-violet-500/10',
};

interface BannerProps {
  title?: ReactNode;
  children?: ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

/** Inline alert strip: tinted surface, icon chip, optional trailing action. */
export function Banner({
  title,
  children,
  tone = 'info',
  icon: Icon,
  action,
  className,
}: BannerProps) {
  const onDark = tone === 'navy';
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-4',
        toneSurface[tone],
        className
      )}
    >
      {Icon && (
        <span
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            onDark ? 'bg-white/10 text-white' : cn('bg-card', toneChip[tone].split(' ')[1])
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {title && (
          <div className={cn('text-sm font-semibold', onDark ? 'text-white' : 'text-foreground')}>
            {title}
          </div>
        )}
        {children && (
          <div className={cn('text-[13px]', onDark ? 'text-white/70' : 'text-muted-foreground')}>
            {children}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
