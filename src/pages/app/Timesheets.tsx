import { useMemo, useState } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { DailyHours } from '@/components/charts/DailyHours';
import {
  Badge, Button, Card, CardBody, CardHeader, EmptyState, ErrorState, Field, Input,
  Modal, PageHeader, PageShell, Select, Skeleton, StatTile, Textarea, compact,
} from '@/components/ui';
import { timesheetsResource, useProjectMap, useTimesheets } from '@/hooks/queries';
import { formatDate, formatHours } from '@/lib/format';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Buckets entries into the trailing 14 days. */
function buildTrend(entries: Array<{ date: string; hours: number }>) {
  const byDay = new Map<string, number>();
  for (const entry of entries) {
    const key = entry.date.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + entry.hours);
  }
  return Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const key = date.toISOString().slice(0, 10);
    return {
      day: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      hours: byDay.get(key) ?? 0,
    };
  });
}

export function Timesheets() {
  const { projects, map } = useProjectMap();
  const [projectFilter, setProjectFilter] = useState('');
  const { data, isPending, isError, error, refetch } = useTimesheets(
    projectFilter ? { project_id: projectFilter } : undefined,
  );
  const createEntry = timesheetsResource.useCreate();
  const removeEntry = timesheetsResource.useRemove();

  const [logging, setLogging] = useState(false);
  const [form, setForm] = useState({
    projectId: '', date: todayISO(), hours: '8', description: '', billable: true,
  });

  const entries = useMemo(
    () => [...(data ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    [data],
  );

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const billableHours = entries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0);
  const trend = useMemo(() => buildTrend(entries), [entries]);

  async function handleLog(e: React.FormEvent) {
    e.preventDefault();
    const hours = Number(form.hours);
    if (!form.projectId || !Number.isFinite(hours) || hours <= 0) return;
    await createEntry.mutateAsync({
      projectId: form.projectId,
      date: form.date,
      hours,
      description: form.description.trim() || null,
      billable: form.billable,
    });
    setLogging(false);
    setForm({ projectId: '', date: todayISO(), hours: '8', description: '', billable: true });
  }

  return (
    <PageShell>
      <PageHeader
        title="Timesheets"
        description="Time logged across every project."
        actions={
          <Button variant="primary" onClick={() => setLogging(true)}>
            <Plus size={15} />
            Log time
          </Button>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {isPending ? (
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <StatTile icon={Clock} label="Total hours" value={compact(totalHours)} trend={trend.map((d) => d.hours)} />
            <StatTile label="Billable hours" value={compact(billableHours)} />
            <StatTile label="Entries" value={entries.length} />
          </>
        )}
      </div>

      <Card className="mt-3">
        <CardHeader title="Hours logged" description="Last 14 days" />
        <CardBody>
          {isPending ? <Skeleton className="h-[200px] w-full" /> : <DailyHours data={trend} />}
        </CardBody>
      </Card>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="">All projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </div>
        {!isPending && <span className="ml-auto text-[13px] text-ink-faint">{entries.length} entries</span>}
      </div>

      <Card className="mt-3 overflow-hidden">
        {isPending ? (
          <CardBody className="space-y-2">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-11" />)}
          </CardBody>
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No time logged"
            description="Log your first entry to start tracking billable hours."
            action={<Button size="sm" variant="primary" onClick={() => setLogging(true)}><Plus size={14} />Log time</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[12px] text-ink-faint">
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Project</th>
                  <th className="px-4 py-2.5 font-medium">Description</th>
                  <th className="px-4 py-2.5 text-right font-medium">Hours</th>
                  <th className="px-4 py-2.5 font-medium">Billable</th>
                  <th className="w-10 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((entry) => {
                  const project = map.get(entry.projectId);
                  return (
                    <tr key={entry.id} className="group transition-colors hover:bg-raised/50">
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-dim">{formatDate(entry.date)}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: project?.color ?? 'var(--color-line-strong)' }}
                          />
                          <span className="truncate text-ink">{project?.name ?? 'Unknown project'}</span>
                        </span>
                      </td>
                      <td className="max-w-xs truncate px-4 py-2.5 text-ink-faint">{entry.description ?? '—'}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-ink">{formatHours(entry.hours)}</td>
                      <td className="px-4 py-2.5">
                        {entry.billable
                          ? <Badge tone="positive">Billable</Badge>
                          : <Badge tone="neutral">Internal</Badge>}
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => removeEntry.mutate(entry.id)}
                          aria-label="Delete entry"
                          className="rounded p-1 text-ink-faint opacity-0 transition hover:bg-critical-soft hover:text-critical group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={logging}
        onClose={() => setLogging(false)}
        title="Log time"
        footer={
          <>
            <Button onClick={() => setLogging(false)}>Cancel</Button>
            <Button
              variant="primary" type="submit" form="log-time"
              loading={createEntry.isPending}
              disabled={!form.projectId || !Number(form.hours)}
            >
              Log entry
            </Button>
          </>
        }
      >
        <form id="log-time" onSubmit={handleLog} className="space-y-4">
          <Field label="Project" required htmlFor="lt-project">
            <Select
              id="lt-project"
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            >
              <option value="">Select a project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" htmlFor="lt-date">
              <Input id="lt-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="Hours" required htmlFor="lt-hours">
              <Input
                id="lt-hours" type="number" min="0.25" step="0.25"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Description" htmlFor="lt-desc">
            <Textarea
              id="lt-desc" rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What you worked on."
            />
          </Field>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-dim">
            <input
              type="checkbox"
              checked={form.billable}
              onChange={(e) => setForm({ ...form, billable: e.target.checked })}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            Billable to the client
          </label>
        </form>
      </Modal>
    </PageShell>
  );
}
