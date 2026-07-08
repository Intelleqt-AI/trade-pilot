import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  value: {
    label: 'Earnings',
    color: '#0f8b7d',
  },
} satisfies ChartConfig;

interface RevenueAreaChartProps {
  /** Series values, oldest first. */
  series: number[];
  /** Optional x labels, same length as series. */
  labels?: string[];
  className?: string;
}

/** Dashboard revenue chart: flat teal area (no gradient), dashed grid,
 *  en-GB £ tooltip. Built on the shadcn chart wrapper. */
export function RevenueAreaChart({ series, labels, className }: RevenueAreaChartProps) {
  const data = series.map((value, i) => ({
    label: labels?.[i] ?? `${i + 1}`,
    value,
  }));
  return (
    <ChartContainer config={chartConfig} className={className ?? 'h-44 w-full'}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e7ebee" />
        <XAxis dataKey="label" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <ChartTooltip
          cursor={{ stroke: '#d3dade', strokeDasharray: '4 4' }}
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="font-mono font-semibold tabular-nums">
                  £{Number(value).toLocaleString('en-GB')}
                </span>
              )}
              hideLabel
            />
          }
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2.25}
          fill="var(--color-value)"
          fillOpacity={0.09}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#ffffff' }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
