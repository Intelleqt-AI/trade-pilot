import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface LogoProps {
  collapsed?: boolean;
  /** Force a specific icon/text variant regardless of site theme — for
   *  panels with a fixed background color. Omit to follow the live theme. */
  onDark?: boolean;
  className?: string;
}

/** TradePilot brand logo — icon mark plus the "Trade✓Pilot" wordmark
 *  (orange check tucked over "Pilot"). Mark variant follows `onDark` when
 *  given, otherwise the current resolved theme. */
export function Logo({ collapsed = false, onDark, className }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = onDark ?? resolvedTheme === 'dark';

  const mark = (
    <img
      src={isDark ? '/tradepilot-darkmood-icon.jpg' : '/tradepilot-lightmood-icon.jpg'}
      alt="TradePilot"
      className="h-[34px] w-[34px] shrink-0 rounded-[9px] object-cover"
    />
  );

  if (collapsed) return <span className={className}>{mark}</span>;

  return (
    <span className={cn('inline-flex items-center gap-[11px]', className)}>
      {mark}
      <span
        className={cn(
          'inline-flex items-baseline text-[19px] font-bold tracking-[-0.02em]',
          isDark ? 'text-white' : 'text-foreground'
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
