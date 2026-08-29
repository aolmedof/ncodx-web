import type { ReactNode } from 'react';

interface Entry {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

/** Shared recharts tooltip. Values wear ink tokens; the swatch carries identity. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Entry[];
  label?: ReactNode;
  formatter?: (value: number | string, name?: string) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="pointer-events-none rounded-md border border-line-strong bg-overlay px-3 py-2 shadow-popover">
      {label != null && <p className="mb-1 text-[12px] font-medium text-ink">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px] leading-5">
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name && <span className="text-ink-dim">{entry.name}</span>}
          <span className="ml-auto pl-3 font-medium text-ink">
            {formatter && entry.value != null
              ? formatter(entry.value, entry.name)
              : String(entry.value ?? '')}
          </span>
        </div>
      ))}
    </div>
  );
}
