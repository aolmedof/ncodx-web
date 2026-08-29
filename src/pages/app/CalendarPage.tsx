import { useMemo } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import {
  Badge, Card, EmptyState, ErrorState, PageHeader, PageShell, Skeleton, type Tone,
} from '@/components/ui';
import { useCalendarEvents } from '@/hooks/queries';
import { useNow } from '@/hooks/useNow';
import { formatTime } from '@/lib/format';
import type { CalendarEvent, CalendarSource } from '@/types';

const SOURCE_TONE: Record<CalendarSource, Tone> = {
  internal: 'brand', google: 'info', outlook: 'caution',
};

function dayKey(iso: string) { return iso.slice(0, 10); }

function dayLabel(key: string, now: number) {
  const date = new Date(`${key}T00:00:00`);
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(today.getDate() + 1);
  if (key === today.toISOString().slice(0, 10)) return 'Today';
  if (key === tomorrow.toISOString().slice(0, 10)) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function CalendarPage() {
  const { data, isPending, isError, error, refetch } = useCalendarEvents();
  const now = useNow();

  const grouped = useMemo(() => {
    const upcoming = [...(data ?? [])]
      .filter((event) => new Date(event.endAt).getTime() >= now - 86_400_000)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));

    const groups = new Map<string, CalendarEvent[]>();
    for (const event of upcoming) {
      const key = dayKey(event.startAt);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(event);
    }
    return Array.from(groups.entries());
  }, [data, now]);

  return (
    <PageShell>
      <PageHeader title="Calendar" description="Upcoming events across your connected calendars." />

      <div className="mt-5 space-y-5">
        {isPending ? (
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-32" />)
        ) : isError ? (
          <Card><ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} /></Card>
        ) : grouped.length === 0 ? (
          <Card>
            <EmptyState
              icon={CalendarDays}
              title="Nothing scheduled"
              description="Events from your connected calendars will appear here."
            />
          </Card>
        ) : (
          grouped.map(([key, events]) => (
            <section key={key}>
              <h2 className="mb-2 text-[13px] font-semibold text-ink">{dayLabel(key, now)}</h2>
              <Card className="overflow-hidden">
                <ul className="divide-y divide-line">
                  {events.map((event) => (
                    <li key={event.id} className="flex gap-3 px-4 py-3">
                      <div className="w-14 shrink-0 text-[12px] tabular">
                        {event.allDay ? (
                          <span className="text-ink-faint">All day</span>
                        ) : (
                          <>
                            <p className="text-ink">{formatTime(event.startAt)}</p>
                            <p className="text-ink-faint">{formatTime(event.endAt)}</p>
                          </>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink">{event.title}</p>
                        {event.description && (
                          <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-ink-faint">
                            {event.description}
                          </p>
                        )}
                        {event.location && (
                          <p className="mt-1 flex items-center gap-1 text-[12px] text-ink-faint">
                            <MapPin size={11} />{event.location}
                          </p>
                        )}
                      </div>
                      <Badge tone={SOURCE_TONE[event.source] ?? 'neutral'}>{event.source}</Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ))
        )}
      </div>
    </PageShell>
  );
}
