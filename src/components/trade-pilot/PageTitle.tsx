import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTitleProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Page heading row: h1 + muted subtitle on the left, action slot on the right. */
export function PageTitle({ title, subtitle, children, className }: PageTitleProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-wrap items-end justify-between gap-4',
        className
      )}
    >
      <div>
        <h1 className="text-h1 font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2.5">{children}</div>}
    </div>
  );
}
