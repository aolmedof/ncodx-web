import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, Search, Filter, Clock, CheckSquare, X } from 'lucide-react';
import { mockProjects } from '@/lib/mock-data';
import type { Project, ProjectStatus } from '@/types';

const STATUS_BADGE: Record<ProjectStatus, { label: string; classes: string }> = {
  active:    { label: 'Active',    classes: 'bg-signal-green/10 text-signal-green border border-signal-green/30' },
  paused:    { label: 'Paused',    classes: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' },
  completed: { label: 'Completed', classes: 'bg-blue-500/10 text-blue-400 border border-blue-500/30' },
  archived:  { label: 'Archived',  classes: 'bg-slate-500/10 text-slate-400 border border-slate-500/30' },
};

const PRESET_COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#dc2626', '#d97706', '#059669'];

interface NewProjectForm {
  name: string;
  description: string;
  color: string;
  client_name: string;
  client_email: string;
  hourly_rate: string;
  github_repo: string;
  azure_devops_org: string;
}

const EMPTY_FORM: NewProjectForm = {
  name: '',
  description: '',
  color: PRESET_COLORS[0],
  client_name: '',
  client_email: '',
  hourly_rate: '',
  github_repo: '',
  azure_devops_org: '',
};

export default function ProjectSelector() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewProjectForm>(EMPTY_FORM);

  const filtered = mockProjects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.client_name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleCardClick(project: Project) {
    navigate(`/app/p/${project.id}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In a real app we'd call an API here
    setShowModal(false);
    setForm(EMPTY_FORM);
  }

  function progressPercent(p: Project) {
    if (p.taskCount === 0) return 0;
    return Math.round((p.completedTaskCount / p.taskCount) * 100);
  }

  return (
    <div className="min-h-screen bg-signal-bg text-signal-text font-mono p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FolderOpen className="text-signal-green" size={24} />
          <h1 className="text-2xl font-bold text-signal-text tracking-tight">Projects</h1>
          <span className="text-xs bg-signal-surface text-signal-text-dim border border-signal-border rounded px-2 py-0.5">
            {mockProjects.length} total
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-signal-green text-signal-bg font-semibold text-sm px-4 py-2 rounded-lg hover:bg-signal-green/90 transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-signal-text-muted" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-signal-surface border border-signal-border rounded-lg pl-9 pr-4 py-2 text-sm text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-signal-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
            className="bg-signal-surface border border-signal-border rounded-lg pl-8 pr-4 py-2 text-sm text-signal-text focus:outline-none focus:border-signal-green transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Project Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-signal-text-muted">
          <FolderOpen size={48} className="mb-4 opacity-30" />
          <p className="text-sm">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const pct = progressPercent(project);
            const badge = STATUS_BADGE[project.status];
            return (
              <button
                key={project.id}
                onClick={() => handleCardClick(project)}
                className="text-left bg-signal-card border border-signal-border rounded-xl overflow-hidden shadow-signal-card hover:border-signal-border-bright transition-all group"
              >
                {/* Colored left stripe top bar */}
                <div className="h-1 w-full" style={{ backgroundColor: project.color }} />

                <div className="p-5">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <h2 className="text-signal-text font-semibold text-base truncate group-hover:text-signal-green transition-colors">
                        {project.name}
                      </h2>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Client name */}
                  {project.client_name && (
                    <p className="text-signal-text-muted text-xs mb-3 pl-5">{project.client_name}</p>
                  )}

                  {/* Description */}
                  <p className="text-signal-text-dim text-xs leading-relaxed line-clamp-2 mb-4">
                    {project.description}
                  </p>

                  {/* Task progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-signal-text-muted text-xs">
                        <CheckSquare size={12} />
                        <span>{project.completedTaskCount} / {project.taskCount} tasks</span>
                      </div>
                      <span className="text-signal-text-muted text-xs">{pct}%</span>
                    </div>
                    <div className="w-full bg-signal-surface rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: project.color }}
                      />
                    </div>
                  </div>

                  {/* Footer: hours badge */}
                  {project.hoursThisWeek !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 text-xs bg-signal-surface border border-signal-border rounded px-2 py-0.5 text-signal-text-dim">
                        <Clock size={11} />
                        <span>{project.hoursThisWeek}h this week</span>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-signal-bg/80 backdrop-blur-sm p-4">
          <div className="bg-signal-card border border-signal-border rounded-2xl w-full max-w-lg shadow-signal-card overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-signal-border">
              <h2 className="text-signal-text font-semibold text-lg">New Project</h2>
              <button
                onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                className="text-signal-text-muted hover:text-signal-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-signal-text-dim text-xs mb-1.5">Project Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Cloud Migration Phase 2"
                  className="w-full bg-signal-surface border border-signal-border rounded-lg px-3 py-2 text-sm text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-signal-text-dim text-xs mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the project..."
                  className="w-full bg-signal-surface border border-signal-border rounded-lg px-3 py-2 text-sm text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green transition-colors resize-none"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-signal-text-dim text-xs mb-1.5">Project Color</label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        form.color === c ? 'border-signal-text scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Client info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-signal-text-dim text-xs mb-1.5">Client Name</label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full bg-signal-surface border border-signal-border rounded-lg px-3 py-2 text-sm text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-signal-text-dim text-xs mb-1.5">Client Email</label>
                  <input
                    type="email"
                    value={form.client_email}
                    onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                    placeholder="client@company.com"
                    className="w-full bg-signal-surface border border-signal-border rounded-lg px-3 py-2 text-sm text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green transition-colors"
                  />
                </div>
              </div>

              {/* Hourly rate */}
              <div>
                <label className="block text-signal-text-dim text-xs mb-1.5">Hourly Rate (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.hourly_rate}
                  onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                  placeholder="85.00"
                  className="w-full bg-signal-surface border border-signal-border rounded-lg px-3 py-2 text-sm text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green transition-colors"
                />
              </div>

              {/* Integrations */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-signal-text-dim text-xs mb-1.5">GitHub Repo</label>
                  <input
                    type="text"
                    value={form.github_repo}
                    onChange={(e) => setForm({ ...form, github_repo: e.target.value })}
                    placeholder="owner/repo"
                    className="w-full bg-signal-surface border border-signal-border rounded-lg px-3 py-2 text-sm text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-signal-text-dim text-xs mb-1.5">Azure DevOps Org</label>
                  <input
                    type="text"
                    value={form.azure_devops_org}
                    onChange={(e) => setForm({ ...form, azure_devops_org: e.target.value })}
                    placeholder="my-org"
                    className="w-full bg-signal-surface border border-signal-border rounded-lg px-3 py-2 text-sm text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                  className="flex-1 bg-signal-surface border border-signal-border text-signal-text-dim text-sm py-2 rounded-lg hover:border-signal-border-bright transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-signal-green text-signal-bg font-semibold text-sm py-2 rounded-lg hover:bg-signal-green/90 transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
