import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tone, toneChip } from './tones';

interface SectionCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  iconTone?: Tone;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** White card surface with an optional bordered header row
 *  (title/subtitle/icon chip on the left, action slot on the right). */
export function SectionCard({
  title,
  subtitle,
  icon: Icon,
  iconTone = 'brand',
  action,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  const hasHeader = Boolean(title || subtitle || Icon || action);
  return (
    <div className={cn('rounded-xl border bg-card shadow-xs', className)}>
      {hasHeader && (
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          {Icon && (
            <span
              className={cn(
                'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                toneChip[iconTone]
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </div>
  );
}
