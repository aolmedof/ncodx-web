import { cn } from '@/components/ui/cn';
import type { Stage } from './tokens';

/**
 * Part-to-whole for an ordered workflow. Segments are separated by a 2px gap in
 * the surface colour rather than by strokes, and the legend always carries the
 * identity so the colour never has to work alone.
 */
export function StageBar({ stages, className = '' }: { stages: Stage[]; className?: string }) {
  const total = stages.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="h-2.5 w-full rounded-full bg-raised" />
        <p className="text-[13px] text-ink-faint">Nothing tracked yet.</p>
      </div>
    );
  }

  const visible = stages.filter((s) => s.value > 0);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full">
        {visible.map((stage, i) => (
          <div
            key={stage.key}
            title={`${stage.label}: ${stage.value}`}
            style={{
              backgroundColor: stage.color,
              flexGrow: stage.value,
              borderTopLeftRadius: i === 0 ? 999 : 0,
              borderBottomLeftRadius: i === 0 ? 999 : 0,
              borderTopRightRadius: i === visible.length - 1 ? 999 : 0,
              borderBottomRightRadius: i === visible.length - 1 ? 999 : 0,
            }}
          />
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {stages.map((stage) => (
          <li key={stage.key} className="flex items-center gap-1.5 text-[12px]">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: stage.color }}
            />
            <span className="text-ink-dim">{stage.label}</span>
            <span className="font-medium text-ink tabular">{stage.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
