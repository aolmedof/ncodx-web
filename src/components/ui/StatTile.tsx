import type { ComponentType } from 'react';
import { cn } from './cn';

/** 12-point sparkline: history in the de-emphasis hue, latest point in accent. */
function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const w = 96;
  const h = 26;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = w / (points.length - 1);
  const xy = points.map((p, i) => [i * step, h - ((p - min) / span) * (h - 4) - 2] as const);
  const d = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lastX, lastY] = xy[xy.length - 1];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="overflow-visible">
      <path d={d} fill="none" stroke="var(--color-line-strong)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* 2px surface ring keeps the end-dot legible where it meets the line */}
      <circle cx={lastX} cy={lastY} r={4} fill="var(--color-brand)" stroke="var(--color-card)" strokeWidth={2} />
    </svg>
  );
}

export function StatTile({
  label,
  value,
  delta,
  deltaLabel,
  /** Set false where a rise is bad (e.g. overdue invoices). */
  upIsGood = true,
  icon: Icon,
  trend,
  className = '',
}: {
  label: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  upIsGood?: boolean;
  icon?: ComponentType<{ size?: number; className?: string }>;
  trend?: number[];
  className?: string;
}) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta) && delta !== 0;
  const good = hasDelta && (delta > 0) === upIsGood;

  return (
    <div className={cn('rounded-lg border border-line bg-card p-4', className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="shrink-0 text-ink-faint" />}
        <p className="truncate text-[13px] text-ink-dim">{label}</p>
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        {/* Proportional figures: tabular-nums makes display numbers look loose */}
        <p className="text-[26px] font-semibold leading-none tracking-tight text-ink">{value}</p>
        {trend && trend.length > 1 && <Sparkline points={trend} />}
      </div>

      {hasDelta && (
        <p className="mt-2 flex items-center gap-1 text-[12px]">
          <span className={good ? 'text-positive' : 'text-critical'}>
            {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
          {deltaLabel && <span className="text-ink-faint">{deltaLabel}</span>}
        </p>
      )}
    </div>
  );
}
