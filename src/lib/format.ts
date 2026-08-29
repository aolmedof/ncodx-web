/** Shared display formatting. Keeping it here stops each page inventing its own. */

export function formatCurrency(
  amount: number | null | undefined,
  currency = 'USD',
  opts: { compact?: boolean } = {},
): string {
  if (amount == null || !Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    notation: opts.compact ? 'compact' : 'standard',
    maximumFractionDigits: opts.compact ? 1 : 2,
    minimumFractionDigits: opts.compact ? 0 : 2,
  }).format(amount);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** "2 days ago" / "in 3 days" — falls back to an absolute date past a month. */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / 86_400_000);
  if (Math.abs(diffDays) > 30) return formatDate(value);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day');
  const diffHours = Math.round(diffMs / 3_600_000);
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour');
  return rtf.format(Math.round(diffMs / 60_000), 'minute');
}

export function formatHours(hours: number | null | undefined): string {
  if (hours == null || !Number.isFinite(hours)) return '0h';
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

/** Text shown when the API sends null for an optional field. */
export const EMPTY = '—';

/** Compact large numbers so a stat tile never wraps: 1,284 · 12.9K · $4.2M */
export function compact(value: number, prefix = ''): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 10_000) return `${prefix}${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${prefix}${value.toLocaleString('en-US')}`;
}
