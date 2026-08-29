import type { ReactNode } from 'react';
import { cn } from './cn';

export type Tone = 'neutral' | 'brand' | 'positive' | 'caution' | 'critical' | 'info';

const TONE: Record<Tone, string> = {
  neutral:  'bg-neutral-soft  text-ink-dim   border-line',
  brand:    'bg-brand-soft    text-brand     border-brand-line',
  positive: 'bg-positive-soft text-positive  border-positive/25',
  caution:  'bg-caution-soft  text-caution   border-caution/25',
  critical: 'bg-critical-soft text-critical  border-critical/25',
  info:     'bg-info-soft     text-info      border-info/25',
};

export function Badge({
  tone = 'neutral',
  dot = false,
  className = '',
  children,
}: {
  tone?: Tone;
  /** Shows a leading status dot in the badge's own colour. */
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5',
        'text-[12px] font-medium leading-5 whitespace-nowrap',
        TONE[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}
