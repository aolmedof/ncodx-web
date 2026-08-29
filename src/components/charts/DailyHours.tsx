import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from './ChartTooltip';
import { AXIS_TICK } from './tokens';

/**
 * Hours logged per day. These are discrete daily totals, so they get columns —
 * an interpolated line would invent values between days that were never worked.
 * Single series, so no legend: the card title names what is plotted.
 */
export function DailyHours({
  data,
  xKey = 'day',
  yKey = 'hours',
  height = 200,
  unit = 'h',
  color = 'var(--color-brand)',
}: {
  data: Array<Record<string, unknown>>;
  xKey?: string;
  yKey?: string;
  height?: number;
  unit?: string;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }} barCategoryGap="18%">
        <CartesianGrid stroke="var(--color-grid)" strokeWidth={1} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: 'var(--color-axis)' }} dy={4} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: 'var(--color-raised)', opacity: 0.5 }}
          content={<ChartTooltip formatter={(v) => `${v}${unit}`} />}
        />
        <Bar
          dataKey={yKey}
          fill={color}
          isAnimationActive={false}
          maxBarSize={24}
          // Rounded data-end, square at the baseline.
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
