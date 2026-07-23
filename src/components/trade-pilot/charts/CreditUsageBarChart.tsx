import { Bar, BarChart, Cell, XAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  value: {
    label: 'Credits',
    color: '#0f8b7d',
  },
} satisfies ChartConfig;

interface CreditUsageBarChartProps {
  /** Monthly credit spend, oldest first (typically 12 entries). */
  series: number[];
  /** Month labels, same length as series (e.g. month initials). */
  labels: string[];
  className?: string;
}

/** Credits screen usage chart: light-teal bars with the current (last)
 *  month highlighted in solid teal. Built on the shadcn chart wrapper. */
export function CreditUsageBarChart({
  series,
  labels,
  className,
}: CreditUsageBarChartProps) {
  const data = series.map((value, i) => ({ label: labels[i] ?? '', value }));
  const last = data.length - 1;
  return (
    <ChartContainer config={chartConfig} className={className ?? 'h-44 w-full'}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: '#6a7680', fontFamily: 'Geist Mono, monospace' }}
        />
        <ChartTooltip
          cursor={{ fill: '#f1f4f6' }}
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="font-mono font-semibold tabular-nums">
                  {Number(value)} credits
                </span>
              )}
              hideLabel
            />
          }
        />
        <Bar dataKey="value" radius={[5, 5, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === last ? '#0f8b7d' : '#c6e7e1'} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
