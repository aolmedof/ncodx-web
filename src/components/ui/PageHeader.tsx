import type { ReactNode } from 'react';
import { cn } from './cn';

/** Consistent page title block. `actions` sits right-aligned on the same line. */
export function PageHeader({
  title,
  description,
  actions,
  className = '',
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="truncate">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-ink-dim">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Standard page padding so every screen lines up. */
export function PageShell({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-6 py-6 lg:px-8', className)}>{children}</div>;
}
