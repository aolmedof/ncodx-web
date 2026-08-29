import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Pipeline, PipelineStatus, RepoBranch, RepoPR } from '@/types';

/* The proxy routes echo each provider's own wire format, so everything is
   normalised here — pages consume one shape regardless of provider. */

interface GhBranch { name: string; protected?: boolean; commit?: { sha?: string } }
interface GhPull {
  id: number; number: number; title: string; state: string; draft?: boolean;
  user?: { login?: string }; base?: { ref?: string }; head?: { ref?: string };
  created_at: string;
}
interface AwsPipeline {
  name: string; status: string; lastExecutionId?: string; created?: string; updated?: string;
}

const AWS_STATUS: Record<string, PipelineStatus> = {
  Succeeded: 'success',
  Failed: 'failed',
  InProgress: 'running',
  Stopped: 'cancelled',
  Superseded: 'cancelled',
};

function splitRepo(repo: string | null | undefined): [string, string] | null {
  if (!repo) return null;
  const [owner, name] = repo.split('/');
  return owner && name ? [owner, name] : null;
}

export function useRepoBranches(githubRepo: string | null | undefined) {
  const parts = splitRepo(githubRepo);
  return useQuery({
    queryKey: ['proxy', 'branches', githubRepo],
    enabled: Boolean(parts),
    queryFn: async (): Promise<RepoBranch[]> => {
      const [owner, repo] = parts!;
      const raw = await api.get<GhBranch[]>(`/proxy/github/repos/${owner}/${repo}/branches`);
      return (raw ?? []).map((b) => ({
        name: b.name,
        sha: b.commit?.sha,
        protected: b.protected,
        isDefault: b.name === 'main' || b.name === 'master',
      }));
    },
  });
}

export function useRepoPulls(githubRepo: string | null | undefined) {
  const parts = splitRepo(githubRepo);
  return useQuery({
    queryKey: ['proxy', 'pulls', githubRepo],
    enabled: Boolean(parts),
    queryFn: async (): Promise<RepoPR[]> => {
      const [owner, repo] = parts!;
      const raw = await api.get<GhPull[]>(`/proxy/github/repos/${owner}/${repo}/pulls`);
      return (raw ?? []).map((p) => ({
        id: p.number ?? p.id,
        title: p.title,
        author: p.user?.login ?? 'unknown',
        status: p.state === 'closed' ? 'closed' : p.state === 'merged' ? 'merged' : 'open',
        branch: p.head?.ref,
        targetBranch: p.base?.ref,
        createdAt: p.created_at,
      }));
    },
  });
}

export function useAwsPipelines() {
  return useQuery({
    queryKey: ['proxy', 'aws-pipelines'],
    queryFn: async (): Promise<Pipeline[]> => {
      const raw = await api.get<{ pipelines?: AwsPipeline[] }>('/proxy/aws/pipelines');
      return (raw?.pipelines ?? []).map((p, i) => ({
        id: p.lastExecutionId ?? `aws-${i}`,
        name: p.name,
        provider: 'aws' as const,
        branch: 'main',
        status: AWS_STATUS[p.status] ?? 'queued',
        startedAt: p.updated ?? p.created,
        timestamp: p.updated ?? p.created,
      }));
    },
  });
}
