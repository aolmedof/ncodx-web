import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary:   'bg-brand text-brand-ink font-medium hover:bg-brand-hover active:bg-brand-press',
  secondary: 'bg-card text-ink border border-line hover:bg-raised hover:border-line-strong',
  ghost:     'text-ink-dim hover:text-ink hover:bg-raised',
  subtle:    'bg-raised text-ink hover:bg-overlay',
  danger:    'bg-critical/10 text-critical border border-critical/25 hover:bg-critical hover:text-white hover:border-critical',
};

const SIZE: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[13px] gap-1.5 rounded-sm',
  md: 'h-8 px-3 text-sm gap-2 rounded-md',
  lg: 'h-10 px-4 text-sm gap-2 rounded-md',
};

const ICON_SIZE: Record<Size, string> = {
  sm: 'h-7 w-7 rounded-sm',
  md: 'h-8 w-8 rounded-md',
  lg: 'h-10 w-10 rounded-md',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Renders a square button sized for a single icon. */
  iconOnly?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  iconOnly = false,
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap transition-colors duration-100',
        'disabled:opacity-45 disabled:pointer-events-none',
        VARIANT[variant],
        iconOnly ? ICON_SIZE[size] : SIZE[size],
        className,
      )}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 animate-spin-slow rounded-full border-[1.5px] border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
