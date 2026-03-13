import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  GitBranch, Play, Clock, User, Hash, MessageSquare,
  CheckCircle2, XCircle, Loader2, AlertCircle, Ban,
} from 'lucide-react';
import { mockProjects, mockPipelines } from '@/lib/mock-data';
import type { Pipeline, PipelineProvider, PipelineStatus } from '@/types';

type ProviderTab = PipelineProvider;

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  PipelineStatus,
  { label: string; dotClass: string; textClass: string; badgeClass: string; icon: typeof CheckCircle2 }
> = {
  success: {
    label: 'Success',
    dotClass: 'bg-signal-green',
    textClass: 'text-signal-green',
    badgeClass: 'text-signal-green bg-signal-green/10 border-signal-green/30',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    dotClass: 'bg-red-500',
    textClass: 'text-red-400',
    badgeClass: 'text-red-400 bg-red-500/10 border-red-500/30',
    icon: XCircle,
  },
  running: {
    label: 'Running',
    dotClass: 'bg-blue-400 animate-pulse',
    textClass: 'text-blue-400',
    badgeClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    icon: Loader2,
  },
  pending: {
    label: 'Pending',
    dotClass: 'bg-yellow-400',
    textClass: 'text-yellow-400',
    badgeClass: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    icon: AlertCircle,
  },
  queued: {
    label: 'Queued',
    dotClass: 'bg-yellow-500',
    textClass: 'text-yellow-500',
    badgeClass: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelled',
    dotClass: 'bg-slate-500',
    textClass: 'text-slate-400',
    badgeClass: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    icon: Ban,
  },
};

const PROVIDER_BADGE: Record<ProviderTab, { label: string; classes: string }> = {
  github: { label: 'GitHub Actions', classes: 'bg-slate-700/70 text-slate-200 border-slate-600/50' },
  azure: { label: 'Azure DevOps', classes: 'bg-blue-900/40 text-blue-300 border-blue-700/40' },
  aws: { label: 'AWS CodeBuild', classes: 'bg-orange-900/30 text-orange-300 border-orange-700/40' },
};

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'just now';
}

function PipelineCard({ pipeline }: { pipeline: Pipeline }) {
  const status = STATUS_CONFIG[pipeline.status];
  const provider = PROVIDER_BADGE[pipeline.provider];
  const StatusIcon = status.icon;

  return (
    <div className="bg-signal-card border border-signal-border hover:border-signal-border-bright rounded-xl p-4 shadow-signal-card transition-colors">
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <div className="flex-shrink-0 mt-1">
          <div className={`w-2.5 h-2.5 rounded-full ${status.dotClass}`} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Row 1: name + status badge */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <code className="text-signal-text font-semibold text-sm truncate">{pipeline.name}</code>
            <span
              className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.badgeClass}`}
            >
              <StatusIcon size={11} className={pipeline.status === 'running' ? 'animate-spin' : ''} />
              {status.label}
            </span>
          </div>

          {/* Row 2: provider + branch */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${provider.classes}`}>
              {provider.label}
            </span>
            {pipeline.buildNumber && (
              <span className="inline-flex items-center gap-1 text-xs text-signal-text-muted">
                <Hash size={11} /> {pipeline.buildNumber}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-signal-text-dim">
              <GitBranch size={11} className="text-signal-green" />
              {pipeline.branch}
            </span>
          </div>

          {/* Commit message */}
          {(pipeline.commitMessage ?? pipeline.commit) && (
            <div className="flex items-start gap-1.5 mb-2">
              <MessageSquare size={11} className="text-signal-text-muted flex-shrink-0 mt-0.5" />
              <span className="text-signal-text-muted text-xs truncate">
                {pipeline.commitMessage ?? pipeline.commit}
              </span>
            </div>
          )}

          {/* Row 3: meta info */}
          <div className="flex items-center gap-4 text-xs text-signal-text-muted flex-wrap">
            {pipeline.triggeredBy && (
              <span className="inline-flex items-center gap-1">
                <User size={11} /> {pipeline.triggeredBy}
              </span>
            )}
            {pipeline.duration && pipeline.duration !== '—' && (
              <span className="inline-flex items-center gap-1">
                <Clock size={11} /> {pipeline.duration}
              </span>
            )}
            {pipeline.timestamp && (
              <span className="text-signal-text-muted">{formatTimestamp(pipeline.timestamp)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ provider }: { provider: ProviderTab }) {
  const labels: Record<ProviderTab, string> = {
    azure: 'Azure DevOps',
    aws: 'AWS CodeBuild',
    github: 'GitHub Actions',
  };
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 bg-signal-surface border border-signal-border rounded-xl flex items-center justify-center mb-4">
        <Play size={20} className="text-signal-text-muted" />
      </div>
      <p className="text-signal-text-dim text-sm font-mono">No {labels[provider]} pipelines found</p>
      <p className="text-signal-text-muted text-xs mt-1 font-mono">
        Configure your {labels[provider]} integration in Project Settings.
      </p>
    </div>
  );
}

export default function Pipelines() {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeProvider, setActiveProvider] = useState<ProviderTab>('azure');
  const [toastVisible, setToastVisible] = useState(false);

  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen bg-signal-bg flex items-center justify-center text-signal-text-muted font-mono">
        Project not found.
      </div>
    );
  }

  const allPipelines: Pipeline[] = mockPipelines[projectId ?? ''] ?? [];
  const filtered = allPipelines.filter((pl) => pl.provider === activeProvider);

  const counts: Record<ProviderTab, number> = {
    azure: allPipelines.filter((pl) => pl.provider === 'azure').length,
    aws: allPipelines.filter((pl) => pl.provider === 'aws').length,
    github: allPipelines.filter((pl) => pl.provider === 'github').length,
  };

  const tabs: { id: ProviderTab; label: string }[] = [
    { id: 'azure', label: 'Azure DevOps' },
    { id: 'aws', label: 'AWS CodeBuild' },
    { id: 'github', label: 'GitHub Actions' },
  ];

  function handleRunPipeline() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }

  return (
    <div className="min-h-screen bg-signal-bg text-signal-text font-mono p-6">
      {/* Toast */}
      {toastVisible && (
        <div className="fixed top-4 right-4 z-50 bg-signal-card border border-signal-green/40 text-signal-green px-4 py-3 rounded-xl shadow-signal-card text-sm font-mono flex items-center gap-2 animate-in slide-in-from-right">
          <CheckCircle2 size={16} />
          Pipeline trigger sent
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-signal-text flex items-center gap-2">
            <Play size={20} className="text-signal-green" />
            CI/CD Pipelines
          </h1>
          <p className="text-signal-text-muted text-sm mt-0.5">
            {project.name} — {allPipelines.length} pipeline run{allPipelines.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleRunPipeline}
          className="flex items-center gap-2 px-4 py-2.5 bg-signal-green/10 hover:bg-signal-green/20 border border-signal-green/40 hover:border-signal-green/70 text-signal-green rounded-xl text-sm font-semibold transition-colors"
        >
          <Play size={15} />
          Run Pipeline
        </button>
      </div>

      {/* Provider Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-signal-surface border border-signal-border rounded-xl p-1 w-fit">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveProvider(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeProvider === id
                ? 'bg-signal-card border border-signal-border text-signal-text shadow-signal-card'
                : 'text-signal-text-muted hover:text-signal-text'
            }`}
          >
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeProvider === id
                  ? 'bg-signal-green/15 text-signal-green'
                  : 'bg-signal-bg text-signal-text-muted'
              }`}
            >
              {counts[id]}
            </span>
          </button>
        ))}
      </div>

      {/* Pipeline Cards */}
      {filtered.length === 0 ? (
        <EmptyState provider={activeProvider} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((pipeline) => (
            <PipelineCard key={pipeline.id} pipeline={pipeline} />
          ))}
        </div>
      )}
    </div>
  );
}
