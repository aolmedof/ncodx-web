import { CircleDashed, Rocket } from 'lucide-react';
import {
  Badge, Card, CardBody, EmptyState, ErrorState, PageHeader, PageShell,
  Skeleton, StatTile, type Tone,
} from '@/components/ui';
import { useAwsPipelines } from '@/hooks/queries/proxy';
import { formatRelative } from '@/lib/format';
import type { PipelineStatus } from '@/types';

const STATUS_TONE: Record<PipelineStatus, Tone> = {
  success: 'positive', failed: 'critical', running: 'info',
  pending: 'caution', queued: 'neutral', cancelled: 'neutral',
};

const STATUS_LABEL: Record<PipelineStatus, string> = {
  success: 'Succeeded', failed: 'Failed', running: 'Running',
  pending: 'Pending', queued: 'Queued', cancelled: 'Cancelled',
};

export default function Pipelines() {
  const { data, isPending, isError, error, refetch } = useAwsPipelines();
  const pipelines = data ?? [];
  const succeeded = pipelines.filter((p) => p.status === 'success').length;
  const failed = pipelines.filter((p) => p.status === 'failed').length;

  return (
    <PageShell>
      <PageHeader title="Pipelines" description="Deployment pipelines reported by AWS CodePipeline." />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {isPending ? (
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <StatTile icon={Rocket} label="Pipelines" value={pipelines.length} />
            <StatTile label="Succeeded" value={succeeded} />
            <StatTile label="Failed" value={failed} upIsGood={false} />
          </>
        )}
      </div>

      <Card className="mt-3 overflow-hidden">
        {isPending ? (
          <CardBody className="space-y-2">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-12" />)}
          </CardBody>
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : pipelines.length === 0 ? (
          <EmptyState icon={CircleDashed} title="No pipelines" description="Nothing reported for this account." />
        ) : (
          <ul className="divide-y divide-line">
            {pipelines.map((pipeline) => (
              <li key={pipeline.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  aria-hidden
                  className={
                    'h-2 w-2 shrink-0 rounded-full ' +
                    (pipeline.status === 'running' ? 'animate-pulse' : '')
                  }
                  style={{
                    backgroundColor:
                      pipeline.status === 'success' ? 'var(--color-positive)'
                        : pipeline.status === 'failed' ? 'var(--color-critical)'
                          : pipeline.status === 'running' ? 'var(--color-info)'
                            : 'var(--color-line-strong)',
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{pipeline.name}</p>
                  <p className="truncate font-mono text-[12px] text-ink-faint">{pipeline.branch}</p>
                </div>
                <span className="hidden text-[12px] text-ink-faint sm:block">
                  {formatRelative(pipeline.startedAt)}
                </span>
                {/* Status ships with a label, never colour alone */}
                <Badge tone={STATUS_TONE[pipeline.status]} dot>{STATUS_LABEL[pipeline.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageShell>
  );
}
