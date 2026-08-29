import type { ComponentType, ReactNode } from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from './cn';

/** Placeholder shown while data loads. Mirrors the shape of the real content. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={cn('animate-shimmer rounded-md bg-raised', className)} />;
}

export function SkeletonRows({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block animate-spin-slow rounded-full border-2 border-line-strong border-t-brand',
        className || 'h-5 w-5',
      )}
    />
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}: {
  icon?: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card">
        <Icon size={18} className="text-ink-faint" />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-ink-faint">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Query failure state. `onRetry` is wired to react-query's refetch. */
export function ErrorState({
  title = 'Could not load this',
  message,
  onRetry,
  className = '',
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-critical/25 bg-critical-soft">
        <AlertTriangle size={18} className="text-critical" />
      </div>
      <p className="text-sm font-medium text-ink">{title}</p>
      {message && <p className="mt-1 max-w-md text-[13px] text-ink-faint">{message}</p>}
      {onRetry && (
        <Button size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw size={13} />
          Retry
        </Button>
      )}
    </div>
  );
}
