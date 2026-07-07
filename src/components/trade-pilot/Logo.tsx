import { cn } from '@/lib/utils';

interface LogoProps {
  collapsed?: boolean;
  onDark?: boolean;
  className?: string;
}

/** TradePilot brand logo — teal rounded-square mark with white check,
 *  plus the "Trade✓Pilot" wordmark (orange check tucked over "Pilot"). */
export function Logo({ collapsed = false, onDark = true, className }: LogoProps) {
  const mark = (
    <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-primary">
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
        <path
          d="M4 12.5L9.5 18L20 6.5"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  if (collapsed) return <span className={className}>{mark}</span>;

  return (
    <span className={cn('inline-flex items-center gap-[11px]', className)}>
      {mark}
      <span
        className={cn(
          'inline-flex items-baseline text-[19px] font-bold tracking-[-0.02em]',
          onDark ? 'text-white' : 'text-foreground'
        )}
      >
        <span>Trade</span>
        <span className="relative">
          <span className="absolute -top-2 left-px -rotate-12 text-[10px] font-extrabold text-orange-500">
            ✓
          </span>
          Pilot
        </span>
      </span>
    </span>
  );
}
