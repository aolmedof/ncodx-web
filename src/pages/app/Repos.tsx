import { useParams } from 'react-router-dom';
import { FolderGit2, GitBranch, GitPullRequest, Lock } from 'lucide-react';
import {
  Badge, Card, CardBody, CardHeader, EmptyState, ErrorState, PageHeader,
  PageShell, Skeleton, type Tone,
} from '@/components/ui';
import { useProject } from '@/hooks/queries';
import { useRepoBranches, useRepoPulls } from '@/hooks/queries/proxy';
import { formatRelative } from '@/lib/format';
import type { RepoPR } from '@/types';

const PR_TONE: Record<RepoPR['status'], Tone> = {
  open: 'positive', merged: 'info', closed: 'neutral',
};

export default function Repos() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const repo = project?.githubRepo ?? null;

  const branches = useRepoBranches(repo);
  const pulls = useRepoPulls(repo);

  if (!repo) {
    return (
      <PageShell>
        <PageHeader title="Repositories" />
        <Card className="mt-5">
          <EmptyState
            icon={FolderGit2}
            title="No repository connected"
            description="Add a GitHub repository in project settings to see branches and pull requests here."
          />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Repositories"
        description={
          <span className="inline-flex items-center gap-1.5">
            <FolderGit2 size={13} />
            <span className="font-mono">{repo}</span>
          </span>
        }
      />

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader title="Branches" description={`${branches.data?.length ?? 0} branches`} />
          {branches.isPending ? (
            <CardBody className="space-y-2">
              {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-9" />)}
            </CardBody>
          ) : branches.isError ? (
            <ErrorState
              message={branches.error instanceof Error ? branches.error.message : undefined}
              onRetry={() => branches.refetch()}
            />
          ) : (branches.data ?? []).length === 0 ? (
            <EmptyState icon={GitBranch} title="No branches" />
          ) : (
            <ul className="divide-y divide-line">
              {(branches.data ?? []).map((branch) => (
                <li key={branch.name} className="flex items-center gap-2.5 px-4 py-2.5">
                  <GitBranch size={14} className="shrink-0 text-ink-faint" />
                  <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">{branch.name}</span>
                  {branch.protected && (
                    <span className="flex items-center gap-1 text-[12px] text-ink-faint">
                      <Lock size={11} />protected
                    </span>
                  )}
                  {branch.isDefault && <Badge tone="brand">default</Badge>}
                  {branch.sha && (
                    <code className="font-mono text-[12px] text-ink-faint">{branch.sha.slice(0, 7)}</code>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Pull requests" description={`${pulls.data?.length ?? 0} open`} />
          {pulls.isPending ? (
            <CardBody className="space-y-2">
              {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-12" />)}
            </CardBody>
          ) : pulls.isError ? (
            <ErrorState
              message={pulls.error instanceof Error ? pulls.error.message : undefined}
              onRetry={() => pulls.refetch()}
            />
          ) : (pulls.data ?? []).length === 0 ? (
            <EmptyState icon={GitPullRequest} title="No pull requests" />
          ) : (
            <ul className="divide-y divide-line">
              {(pulls.data ?? []).map((pr) => (
                <li key={pr.id} className="px-4 py-2.5">
                  <div className="flex items-start gap-2.5">
                    <GitPullRequest size={14} className="mt-0.5 shrink-0 text-ink-faint" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] text-ink">
                        <span className="text-ink-faint">#{pr.id}</span> {pr.title}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[12px] text-ink-faint">
                        {pr.branch} → {pr.targetBranch}
                      </p>
                      <p className="mt-0.5 text-[12px] text-ink-faint">
                        {pr.author} · {formatRelative(pr.createdAt)}
                      </p>
                    </div>
                    <Badge tone={PR_TONE[pr.status]}>{pr.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
