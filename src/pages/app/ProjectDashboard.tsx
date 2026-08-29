import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckSquare, Clock, FileSignature, FileText, ListTodo } from 'lucide-react';
import { StageBar } from '@/components/charts/StageBar';
import { TASK_STAGES } from '@/components/charts/tokens';
import { DailyHours } from '@/components/charts/DailyHours';
import {
  Badge, Card, CardBody, CardHeader, EmptyState, ErrorState, PageHeader, PageShell,
  Skeleton, StatTile, compact, type Tone,
} from '@/components/ui';
import { useContracts, useInvoices, useProject, useTasks, useTimesheets } from '@/hooks/queries';
import { formatCurrency, formatDateShort, formatRelative } from '@/lib/format';
import type { TaskPriority, TaskStatus } from '@/types';

const PRIORITY_TONE: Record<TaskPriority, Tone> = {
  urgent: 'critical',
  high: 'caution',
  medium: 'info',
  low: 'neutral',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'In review',
  done: 'Done',
};

/** Buckets timesheet hours into the trailing 14 days for the trend chart. */
function buildTrend(entries: Array<{ date: string; hours: number }>) {
  const byDay = new Map<string, number>();
  for (const entry of entries) {
    const key = entry.date.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + entry.hours);
  }
  const days: Array<{ day: string; hours: number }> = [];
  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    days.push({
      day: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      hours: byDay.get(key) ?? 0,
    });
  }
  return days;
}

export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const scope = { project_id: projectId };

  const project = useProject(projectId);
  const tasks = useTasks(scope);
  const timesheets = useTimesheets(scope);
  const invoices = useInvoices(scope);
  const contracts = useContracts(scope);

  const taskList = useMemo(() => tasks.data ?? [], [tasks.data]);
  const entries = useMemo(() => timesheets.data ?? [], [timesheets.data]);

  const stages = useMemo(
    () =>
      TASK_STAGES.map((stage) => ({
        ...stage,
        value: taskList.filter((task) => task.status === stage.key).length,
      })),
    [taskList],
  );

  const trend = useMemo(() => buildTrend(entries), [entries]);
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const openTasks = taskList.filter((task) => task.status !== 'done').length;
  const pendingInvoices = (invoices.data ?? []).filter((inv) => inv.status !== 'paid');
  const pendingTotal = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const activeContracts = (contracts.data ?? []).filter((c) => c.status === 'active').length;

  const recentTasks = useMemo(
    () =>
      [...taskList]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [taskList],
  );

  const currency = project.data?.currency ?? 'USD';
  const loading = tasks.isPending || timesheets.isPending;

  return (
    <PageShell>
      <PageHeader
        title={project.data?.name ?? 'Overview'}
        description={project.data?.clientName ?? undefined}
      />

      {tasks.isError ? (
        <ErrorState
          className="mt-6"
          message={tasks.error instanceof Error ? tasks.error.message : undefined}
          onRetry={() => tasks.refetch()}
        />
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[104px]" />)
            ) : (
              <>
                <StatTile
                  icon={ListTodo}
                  label="Open tasks"
                  value={openTasks}
                  trend={stages.map((s) => s.value)}
                />
                <StatTile
                  icon={Clock}
                  label="Hours logged"
                  value={compact(totalHours)}
                  trend={trend.map((d) => d.hours)}
                />
                <StatTile
                  icon={FileText}
                  label="Pending invoices"
                  value={formatCurrency(pendingTotal, currency, { compact: true })}
                  upIsGood={false}
                />
                <StatTile icon={FileSignature} label="Active contracts" value={activeContracts} />
              </>
            )}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Hours logged"
                description="Billable and non-billable time over the last 14 days"
              />
              <CardBody>
                {timesheets.isPending ? (
                  <Skeleton className="h-[200px] w-full" />
                ) : (
                  <DailyHours data={trend} />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Task progress" />
              <CardBody>
                {tasks.isPending ? <Skeleton className="h-24 w-full" /> : <StageBar stages={stages} />}
              </CardBody>
            </Card>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Recent activity"
                action={
                  <Link
                    to={`/app/p/${projectId}/boards`}
                    className="text-[13px] text-brand hover:underline"
                  >
                    View board
                  </Link>
                }
              />
              {tasks.isPending ? (
                <CardBody className="space-y-2">
                  {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10" />)}
                </CardBody>
              ) : recentTasks.length === 0 ? (
                <EmptyState
                  icon={CheckSquare}
                  title="No tasks yet"
                  description="Tasks you add to this project's board show up here."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {recentTasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-ink">{task.title}</span>
                        <span className="text-[12px] text-ink-faint">
                          {STATUS_LABEL[task.status]} · {formatRelative(task.updatedAt)}
                        </span>
                      </span>
                      <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader
                title="Invoices"
                action={
                  <Link to="/app/invoices" className="text-[13px] text-brand hover:underline">
                    All invoices
                  </Link>
                }
              />
              {invoices.isPending ? (
                <CardBody className="space-y-2">
                  {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-10" />)}
                </CardBody>
              ) : (invoices.data ?? []).length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No invoices"
                  description="Generate one from tracked time when you are ready to bill."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {(invoices.data ?? []).slice(0, 6).map((invoice) => (
                    <li key={invoice.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[13px] text-ink">
                          {invoice.invoiceNumber}
                        </span>
                        <span className="text-[12px] text-ink-faint">
                          Due {formatDateShort(invoice.dueDate)}
                        </span>
                      </span>
                      <span className="text-[13px] font-medium text-ink tabular">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </span>
                      <Badge
                        tone={
                          invoice.status === 'paid'
                            ? 'positive'
                            : invoice.status === 'overdue'
                              ? 'critical'
                              : invoice.status === 'sent'
                                ? 'info'
                                : 'neutral'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </PageShell>
  );
}
