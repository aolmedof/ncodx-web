import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  GitBranch, GitCommit, GitPullRequest, Github, Shield, Star,
  CheckCircle2, Clock, XCircle, GitMerge,
} from 'lucide-react';
import { mockProjects, mockBranches, mockCommits, mockPRs } from '@/lib/mock-data';
import type { RepoBranch, RepoCommit, RepoPR } from '@/types';

type Tab = 'branches' | 'commits' | 'pulls';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
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

function PRStatusBadge({ status }: { status: RepoPR['status'] }) {
  if (status === 'open') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-signal-green/10 text-signal-green border border-signal-green/30">
        <CheckCircle2 size={11} /> open
      </span>
    );
  }
  if (status === 'merged') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
        <GitMerge size={11} /> merged
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/30">
      <XCircle size={11} /> closed
    </span>
  );
}

function BranchesTable({ branches }: { branches: (RepoBranch & { isDefault: boolean })[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-signal-border">
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">Name</th>
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">SHA</th>
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">Author</th>
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">Last Commit</th>
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">Updated</th>
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">Badges</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr
              key={branch.name}
              className="border-b border-signal-border/50 hover:bg-signal-surface/60 transition-colors"
            >
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <GitBranch size={13} className="text-signal-green flex-shrink-0" />
                  <span className="text-signal-text font-semibold">{branch.name}</span>
                </div>
              </td>
              <td className="py-3 px-3">
                <code className="text-signal-green bg-signal-green/10 px-1.5 py-0.5 rounded text-xs">
                  {branch.sha.slice(0, 7)}
                </code>
              </td>
              <td className="py-3 px-3 text-signal-text-dim">{branch.author}</td>
              <td className="py-3 px-3 text-signal-text-dim max-w-[240px] truncate">
                {branch.lastCommit ?? '—'}
              </td>
              <td className="py-3 px-3 text-signal-text-muted">
                {branch.updatedAt ? formatRelativeTime(branch.updatedAt) : '—'}
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-1.5">
                  {branch.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-signal-green/10 text-signal-green border border-signal-green/30">
                      <Star size={10} /> default
                    </span>
                  )}
                  {branch.protected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <Shield size={10} /> protected
                    </span>
                  )}
                  {!branch.isDefault && !branch.protected && (
                    <span className="text-signal-text-muted">—</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommitsList({ commits }: { commits: RepoCommit[] }) {
  return (
    <ul className="divide-y divide-signal-border/50">
      {commits.map((commit) => (
        <li
          key={commit.sha}
          className="flex items-start gap-4 py-3.5 px-4 hover:bg-signal-surface/60 transition-colors"
        >
          <GitCommit size={15} className="text-signal-green flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p className="text-signal-text text-sm font-medium truncate">{commit.message}</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-xs text-signal-text-muted">
                  <GitBranch size={11} /> {commit.branch}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <code className="text-signal-green bg-signal-green/10 px-1.5 py-0.5 rounded text-xs font-mono">
                {commit.sha.slice(0, 7)}
              </code>
              <span className="text-signal-text-muted text-xs">{commit.author}</span>
              <span className="text-signal-text-muted text-xs flex items-center gap-1">
                <Clock size={11} /> {formatRelativeTime(commit.date)}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PRsTable({ prs }: { prs: RepoPR[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-signal-border">
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">#</th>
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">Title</th>
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">Author</th>
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">Branch → Target</th>
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">Status</th>
            <th className="text-left py-2.5 px-3 text-signal-text-muted font-medium uppercase tracking-wider">Created</th>
          </tr>
        </thead>
        <tbody>
          {prs.map((pr) => (
            <tr
              key={pr.id}
              className="border-b border-signal-border/50 hover:bg-signal-surface/60 transition-colors"
            >
              <td className="py-3 px-3">
                <code className="text-signal-text-muted">#{pr.id}</code>
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <GitPullRequest size={13} className="text-signal-green flex-shrink-0" />
                  <span className="text-signal-text font-medium max-w-[220px] truncate">{pr.title}</span>
                </div>
              </td>
              <td className="py-3 px-3 text-signal-text-dim">{pr.author}</td>
              <td className="py-3 px-3">
                <span className="text-signal-text-dim">{pr.branch}</span>
                <span className="text-signal-text-muted mx-1">→</span>
                <span className="text-signal-text-dim">{pr.targetBranch}</span>
              </td>
              <td className="py-3 px-3">
                <PRStatusBadge status={pr.status} />
              </td>
              <td className="py-3 px-3 text-signal-text-muted">{formatRelativeTime(pr.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Repos() {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('branches');
  const [repoInput, setRepoInput] = useState('');

  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen bg-signal-bg flex items-center justify-center text-signal-text-muted font-mono">
        Project not found.
      </div>
    );
  }

  const rawBranches = mockBranches[projectId ?? ''] ?? [];
  const branches = rawBranches.map((b) => ({
    ...b,
    isDefault: b.isDefault ?? b.name === 'main',
    updatedAt: b.updatedAt ?? new Date().toISOString(),
  }));
  const commits = mockCommits[projectId ?? ''] ?? [];
  const prs = mockPRs[projectId ?? ''] ?? [];

  if (!project.github_repo) {
    return (
      <div className="min-h-screen bg-signal-bg flex items-center justify-center p-6 font-mono">
        <div className="w-full max-w-md bg-signal-card border border-signal-border rounded-2xl p-8 shadow-signal-card text-center">
          <div className="flex items-center justify-center mb-5">
            <div className="w-16 h-16 bg-signal-surface border border-signal-border rounded-2xl flex items-center justify-center">
              <Github size={32} className="text-signal-green" />
            </div>
          </div>
          <h2 className="text-signal-text text-lg font-bold mb-2">Connect GitHub Repository</h2>
          <p className="text-signal-text-muted text-sm mb-6">
            Link a GitHub repository to view branches, commits, and pull requests for this project.
          </p>
          <div className="text-left space-y-3">
            <label className="block text-signal-text-dim text-xs mb-1">Repository (owner/repo)</label>
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="e.g. aolmedof/cloud-migration"
              className="w-full px-3 py-2.5 bg-signal-surface border border-signal-border rounded-lg text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green/60 text-sm font-mono"
            />
            <button
              onClick={() => {}}
              className="w-full py-2.5 bg-signal-green/10 hover:bg-signal-green/20 border border-signal-green/40 hover:border-signal-green/70 text-signal-green rounded-lg text-sm font-semibold transition-colors"
            >
              Connect Repository
            </button>
          </div>
          <p className="text-signal-text-muted text-xs mt-4">
            You can also configure this in Project Settings → Integrations.
          </p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof GitBranch; count: number }[] = [
    { id: 'branches', label: 'Branches', icon: GitBranch, count: branches.length },
    { id: 'commits', label: 'Commits', icon: GitCommit, count: commits.length },
    { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest, count: prs.length },
  ];

  return (
    <div className="min-h-screen bg-signal-bg text-signal-text font-mono p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-signal-text flex items-center gap-2">
            <Github size={20} className="text-signal-green" />
            Repository
          </h1>
          <p className="text-signal-text-muted text-sm mt-0.5">
            <a
              href={`https://github.com/${project.github_repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-signal-green hover:underline"
            >
              {project.github_repo}
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-signal-text-muted bg-signal-surface border border-signal-border px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-signal-green inline-block" />
          Connected
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-signal-surface border border-signal-border rounded-xl p-1 w-fit">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-signal-card border border-signal-border text-signal-text shadow-signal-card'
                : 'text-signal-text-muted hover:text-signal-text'
            }`}
          >
            <Icon size={14} className={activeTab === id ? 'text-signal-green' : ''} />
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === id
                  ? 'bg-signal-green/15 text-signal-green'
                  : 'bg-signal-bg text-signal-text-muted'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-signal-card border border-signal-border rounded-xl shadow-signal-card overflow-hidden">
        {activeTab === 'branches' && (
          branches.length === 0
            ? <p className="text-signal-text-muted text-sm p-6">No branches found.</p>
            : <BranchesTable branches={branches} />
        )}
        {activeTab === 'commits' && (
          commits.length === 0
            ? <p className="text-signal-text-muted text-sm p-6">No commits found.</p>
            : <CommitsList commits={commits} />
        )}
        {activeTab === 'pulls' && (
          prs.length === 0
            ? <p className="text-signal-text-muted text-sm p-6">No pull requests found.</p>
            : <PRsTable prs={prs} />
        )}
      </div>
    </div>
  );
}
