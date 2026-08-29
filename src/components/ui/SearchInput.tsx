import { Search, X } from 'lucide-react';
import { cn } from './cn';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={14}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={
          'h-9 w-full rounded-md border border-line bg-canvas pl-9 pr-8 text-sm text-ink ' +
          'transition-colors placeholder:text-ink-faint hover:border-line-strong ' +
          'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 ' +
          '[&::-webkit-search-cancel-button]:hidden'
        }
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-faint hover:text-ink"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
