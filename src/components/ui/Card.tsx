import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover affordance for cards that navigate somewhere. */
  interactive?: boolean;
}

export function Card({ interactive = false, className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-line bg-card',
        interactive && 'transition-colors hover:border-line-strong hover:bg-raised',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  description,
  className = '',
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-line px-4 py-3', className)}>
      <div className="min-w-0">
        <h3 className="truncate text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] text-ink-faint">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}
