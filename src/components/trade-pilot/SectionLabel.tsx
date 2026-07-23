import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

/** Uppercase overline label used above stats and section groups. */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        'text-overline font-semibold uppercase text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}
