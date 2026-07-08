import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export interface SegmentedItem {
  value: string;
  label: string;
  count?: number;
}

interface SegmentedControlProps {
  items: (SegmentedItem | string)[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

/** Pill tab switcher on Radix Tabs: sunken track, white active segment,
 *  optional mono count chip per item. */
export function SegmentedControl({
  items,
  value,
  onChange,
  size = 'md',
  className,
}: SegmentedControlProps) {
  const normalised: SegmentedItem[] = items.map((it) =>
    typeof it === 'string' ? { value: it, label: it } : it
  );
  return (
    <TabsPrimitive.Root value={value} onValueChange={onChange} className={className}>
      <TabsPrimitive.List
        className={cn(
          'inline-flex items-center gap-0.5 rounded-lg border border-gray-100 bg-gray-50 p-0.5',
          size === 'sm' ? 'h-8' : 'h-[38px]'
        )}
      >
        {normalised.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              'group inline-flex h-full items-center gap-1.5 whitespace-nowrap rounded-md font-semibold text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-xs',
              size === 'sm' ? 'px-2.5 text-xs' : 'px-3 text-[13px]'
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="rounded bg-gray-100 px-1 font-mono text-[11px] font-semibold tabular-nums text-gray-500 group-data-[state=active]:bg-teal-50 group-data-[state=active]:text-teal-700">
                {item.count}
              </span>
            )}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}
