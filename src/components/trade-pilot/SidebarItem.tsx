import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to?: string;
  active?: boolean;
  collapsed?: boolean;
  badge?: number | string;
  onClick?: () => void;
}

/** Dark-surface sidebar nav row: 3px teal active rail, teal-tinted active
 *  background, optional count badge (dot when collapsed). */
export function SidebarItem({
  icon: Icon,
  label,
  to,
  active = false,
  collapsed = false,
  badge,
  onClick,
}: SidebarItemProps) {
  const content = (
    <>
      <span
        className={cn(
          'absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-teal-400 transition-opacity',
          active ? 'opacity-100' : 'opacity-0'
        )}
      />
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0',
          active ? 'text-teal-200' : 'text-white/55 group-hover:text-white/80'
        )}
      />
      {!collapsed && <span className="min-w-0 flex-1 truncate text-left">{label}</span>}
      {badge !== undefined &&
        (collapsed ? (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
        ) : (
          <span className="rounded-full bg-primary/30 px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-teal-100">
            {badge}
          </span>
        ))}
    </>
  );

  const classes = cn(
    'group relative flex h-[42px] w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25',
    collapsed && 'justify-center px-0',
    active
      ? 'bg-primary/20 text-white'
      : 'text-white/60 hover:bg-white/5 hover:text-white'
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={classes}
        title={collapsed ? label : undefined}
        aria-current={active ? 'page' : undefined}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      title={collapsed ? label : undefined}
    >
      {content}
    </button>
  );
}
