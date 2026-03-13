import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Settings, Link2, AlertTriangle, Save, CheckCircle2,
  Github, Cloud, Code2, Eye, EyeOff, Plug, Unplug,
  Archive, Trash2, Globe, DollarSign,
} from 'lucide-react';
import { mockProjects } from '@/lib/mock-data';
import type { Project, ProjectStatus } from '@/types';

type Tab = 'general' | 'integrations' | 'danger';

// ─── Color presets ────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  '#2563eb', '#0d9488', '#7c3aed', '#dc2626', '#d97706', '#059669',
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active',    label: 'Active' },
  { value: 'paused',    label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived',  label: 'Archived' },
];

const AWS_REGIONS = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'eu-west-1', 'eu-west-2', 'eu-central-1',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
  'sa-east-1', 'ca-central-1',
];

// ─── Reusable input styles ────────────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2.5 bg-signal-surface border border-signal-border rounded-lg text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green/60 text-sm font-mono transition-colors';

const labelCls = 'block text-signal-text-dim text-xs font-medium mb-1.5 uppercase tracking-wider';

function MaskedInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-signal-text-muted hover:text-signal-text transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

// ─── General Tab ─────────────────────────────────────────────────────────────
function GeneralTab({ project }: { project: Project }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: project.name,
    description: project.description,
    color: project.color,
    status: project.status as ProjectStatus,
    client_name: project.client_name ?? '',
    client_email: project.client_email ?? '',
    hourly_rate: project.hourly_rate?.toString() ?? '',
    currency: project.currency ?? 'USD',
    monthly_rate: project.monthly_rate?.toString() ?? '',
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      {/* Project Info */}
      <div className="bg-signal-card border border-signal-border rounded-xl p-5 shadow-signal-card space-y-4">
        <h3 className="text-signal-text font-semibold text-sm flex items-center gap-2">
          <Settings size={14} className="text-signal-green" />
          Project Information
        </h3>

        <div>
          <label className={labelCls}>Project Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Project name"
            className={inputCls}
            required
          />
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe this project..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
              className={inputCls}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Accent Color</label>
            <div className="flex items-center gap-2 mt-1">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    form.color === c
                      ? 'border-signal-text scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-7 h-7 rounded-full border border-signal-border bg-transparent cursor-pointer"
                title="Custom color"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Client / Billing */}
      <div className="bg-signal-card border border-signal-border rounded-xl p-5 shadow-signal-card space-y-4">
        <h3 className="text-signal-text font-semibold text-sm flex items-center gap-2">
          <DollarSign size={14} className="text-signal-green" />
          Client &amp; Billing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Client Name</label>
            <input
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              placeholder="Client or company name"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Client Email</label>
            <input
              type="email"
              value={form.client_email}
              onChange={(e) => setForm({ ...form, client_email: e.target.value })}
              placeholder="client@example.com"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Hourly Rate</label>
            <input
              type="number"
              min="0"
              value={form.hourly_rate}
              onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
              placeholder="85"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Monthly Rate</label>
            <input
              type="number"
              min="0"
              value={form.monthly_rate}
              onChange={(e) => setForm({ ...form, monthly_rate: e.target.value })}
              placeholder="0"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className={inputCls}
            >
              {['USD', 'EUR', 'MXN', 'GBP', 'CAD'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-signal-green/10 hover:bg-signal-green/20 border border-signal-green/40 hover:border-signal-green/70 text-signal-green rounded-xl text-sm font-semibold transition-colors"
        >
          <Save size={15} />
          Save Changes
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-signal-green text-sm">
            <CheckCircle2 size={14} /> Saved successfully
          </span>
        )}
      </div>
    </form>
  );
}

// ─── Integrations Tab ─────────────────────────────────────────────────────────
function IntegrationsTab({ project }: { project: Project }) {
  const [azure, setAzure] = useState({
    org: project.azure_devops_org ?? '',
    project: project.azure_devops_project ?? '',
    pat: '',
    connected: !!(project.azure_devops_org && project.azure_devops_project),
  });
  const [github, setGithub] = useState({
    repo: project.github_repo ?? '',
    connected: !!project.github_repo,
  });
  const [aws, setAws] = useState({
    accountId: project.aws_account_id ?? '',
    region: project.aws_region ?? 'us-east-1',
    accessKey: '',
    connected: !!(project.aws_account_id),
  });

  function ConnectButton({
    connected,
    onConnect,
    onDisconnect,
  }: {
    connected: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
  }) {
    if (connected) {
      return (
        <button
          type="button"
          onClick={onDisconnect}
          className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-700/40 text-red-400 rounded-lg text-sm font-medium transition-colors"
        >
          <Unplug size={14} /> Disconnect
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={onConnect}
        className="flex items-center gap-2 px-4 py-2 bg-signal-green/10 hover:bg-signal-green/20 border border-signal-green/40 text-signal-green rounded-lg text-sm font-medium transition-colors"
      >
        <Plug size={14} /> Connect
      </button>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Azure DevOps */}
      <div className="bg-signal-card border border-signal-border rounded-xl p-5 shadow-signal-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-900/40 border border-blue-700/40 rounded-lg flex items-center justify-center">
              <Code2 size={16} className="text-blue-300" />
            </div>
            <div>
              <h3 className="text-signal-text font-semibold text-sm">Azure DevOps</h3>
              <p className="text-signal-text-muted text-xs">Pipelines, boards, and repos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {azure.connected && (
              <span className="text-xs text-signal-green flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-green inline-block" /> Connected
              </span>
            )}
            <ConnectButton
              connected={azure.connected}
              onConnect={() => setAzure({ ...azure, connected: true })}
              onDisconnect={() => setAzure({ ...azure, connected: false })}
            />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Organization</label>
            <input
              value={azure.org}
              onChange={(e) => setAzure({ ...azure, org: e.target.value })}
              placeholder="e.g. ncodx"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Project</label>
            <input
              value={azure.project}
              onChange={(e) => setAzure({ ...azure, project: e.target.value })}
              placeholder="e.g. CloudMigration"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Personal Access Token (PAT)</label>
            <MaskedInput
              value={azure.pat}
              onChange={(v) => setAzure({ ...azure, pat: v })}
              placeholder="Azure DevOps PAT"
            />
          </div>
        </div>
      </div>

      {/* GitHub */}
      <div className="bg-signal-card border border-signal-border rounded-xl p-5 shadow-signal-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-700/60 border border-slate-600/50 rounded-lg flex items-center justify-center">
              <Github size={16} className="text-slate-200" />
            </div>
            <div>
              <h3 className="text-signal-text font-semibold text-sm">GitHub</h3>
              <p className="text-signal-text-muted text-xs">Repository and Actions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {github.connected && (
              <span className="text-xs text-signal-green flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-green inline-block" /> Connected
              </span>
            )}
            <ConnectButton
              connected={github.connected}
              onConnect={() => setGithub({ ...github, connected: true })}
              onDisconnect={() => setGithub({ ...github, connected: false })}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Repository (owner/repo)</label>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-signal-text-muted flex-shrink-0" />
            <input
              value={github.repo}
              onChange={(e) => setGithub({ ...github, repo: e.target.value })}
              placeholder="e.g. aolmedof/cloud-migration"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* AWS */}
      <div className="bg-signal-card border border-signal-border rounded-xl p-5 shadow-signal-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-900/30 border border-orange-700/40 rounded-lg flex items-center justify-center">
              <Cloud size={16} className="text-orange-300" />
            </div>
            <div>
              <h3 className="text-signal-text font-semibold text-sm">AWS</h3>
              <p className="text-signal-text-muted text-xs">CodeBuild, ECS, and infrastructure</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {aws.connected && (
              <span className="text-xs text-signal-green flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-green inline-block" /> Connected
              </span>
            )}
            <ConnectButton
              connected={aws.connected}
              onConnect={() => setAws({ ...aws, connected: true })}
              onDisconnect={() => setAws({ ...aws, connected: false })}
            />
          </div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Account ID</label>
              <input
                value={aws.accountId}
                onChange={(e) => setAws({ ...aws, accountId: e.target.value })}
                placeholder="123456789012"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Region</label>
              <select
                value={aws.region}
                onChange={(e) => setAws({ ...aws, region: e.target.value })}
                className={inputCls}
              >
                {AWS_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Access Key ID</label>
            <MaskedInput
              value={aws.accessKey}
              onChange={(v) => setAws({ ...aws, accessKey: v })}
              placeholder="AKIAIOSFODNN7EXAMPLE"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Danger Zone Tab ──────────────────────────────────────────────────────────
function DangerTab({ project }: { project: Project }) {
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-signal-card border border-red-700/50 rounded-xl p-5 shadow-signal-card">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={16} className="text-red-400" />
          <h3 className="text-red-400 font-semibold text-sm uppercase tracking-wider">Danger Zone</h3>
        </div>

        {/* Archive */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-signal-border">
          <div>
            <p className="text-signal-text text-sm font-semibold flex items-center gap-2">
              <Archive size={14} className="text-orange-400" />
              Archive Project
            </p>
            <p className="text-signal-text-muted text-xs mt-1">
              Mark this project as archived. It will be hidden from active views but data will be retained.
              You can unarchive it at any time.
            </p>
            {archiveConfirm && (
              <p className="text-orange-400 text-xs mt-2 font-medium">
                Are you sure? Click Archive again to confirm.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (!archiveConfirm) {
                setArchiveConfirm(true);
                setTimeout(() => setArchiveConfirm(false), 4000);
              }
            }}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-orange-900/20 hover:bg-orange-900/40 border border-orange-700/50 text-orange-400 rounded-lg text-sm font-medium transition-colors"
          >
            <Archive size={14} />
            {archiveConfirm ? 'Confirm Archive' : 'Archive Project'}
          </button>
        </div>

        {/* Delete */}
        <div className="flex items-start justify-between gap-4 pt-5">
          <div>
            <p className="text-signal-text text-sm font-semibold flex items-center gap-2">
              <Trash2 size={14} className="text-red-400" />
              Delete Project
            </p>
            <p className="text-signal-text-muted text-xs mt-1">
              Permanently delete <strong className="text-signal-text-dim">{project.name}</strong> and
              all associated data including tasks, timesheets, invoices, and secrets.
              <span className="text-red-400 font-medium"> This action cannot be undone.</span>
            </p>
            {deleteConfirm && (
              <p className="text-red-400 text-xs mt-2 font-medium">
                This will permanently delete all project data. Click Delete again to confirm.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (!deleteConfirm) {
                setDeleteConfirm(true);
                setTimeout(() => setDeleteConfirm(false), 4000);
              }
            }}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/60 text-red-400 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 size={14} />
            {deleteConfirm ? 'Confirm Delete' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen bg-signal-bg flex items-center justify-center text-signal-text-muted font-mono">
        Project not found.
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Settings }[] = [
    { id: 'general',      label: 'General',      icon: Settings      },
    { id: 'integrations', label: 'Integrations',  icon: Link2         },
    { id: 'danger',       label: 'Danger Zone',   icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-signal-bg text-signal-text font-mono p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-signal-text flex items-center gap-2">
          <Settings size={20} className="text-signal-green" />
          Project Settings
        </h1>
        <p className="text-signal-text-muted text-sm mt-0.5">
          Configure <span className="text-signal-text-dim">{project.name}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-signal-surface border border-signal-border rounded-xl p-1 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-signal-card border border-signal-border text-signal-text shadow-signal-card'
                : 'text-signal-text-muted hover:text-signal-text'
            } ${id === 'danger' && activeTab !== 'danger' ? 'hover:text-red-400' : ''}`}
          >
            <Icon
              size={14}
              className={
                id === 'danger'
                  ? activeTab === 'danger' ? 'text-red-400' : 'text-signal-text-muted'
                  : activeTab === id
                  ? 'text-signal-green'
                  : ''
              }
            />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'general'      && <GeneralTab project={project} />}
      {activeTab === 'integrations' && <IntegrationsTab project={project} />}
      {activeTab === 'danger'       && <DangerTab project={project} />}
    </div>
  );
}
