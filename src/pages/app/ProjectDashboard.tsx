import { useParams, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  CheckSquare, Clock, AlertCircle, ListTodo, Plus, FileText, Zap,
  GitBranch, CalendarDays, Activity,
} from 'lucide-react';
import { mockProjects, mockTasks, mockPipelines, mockCalendarEvents } from '@/lib/mock-data';
import type { PipelineStatus, PipelineProvider } from '@/types';

const hoursData = [
  { day: 'Lun', hours: 8 },
  { day: 'Mar', hours: 6 },
  { day: 'Mie', hours: 9 },
  { day: 'Jue', hours: 7 },
  { day: 'Vie', hours: 10 },
  { day: 'Sab', hours: 4 },
  { day: 'Dom', hours: 0 },
];

const STATUS_TASK_ICON: Record<string, string> = {
  todo: '○',
  in_progress: '◑',
  review: '◕',
  done: '●',
};

const STATUS_TASK_COLOR: Record<string, string> = {
  todo: 'text-signal-text-muted',
  in_progress: 'text-blue-400',
  review: 'text-yellow-400',
  done: 'text-signal-green',
};

const PIPELINE_STATUS_STYLES: Record<PipelineStatus, { dot: string; label: string; badge: string }> = {
  success:   { dot: 'bg-signal-green', label: 'Success',   badge: 'text-signal-green bg-signal-green/10 border-signal-green/30' },
  failed:    { dot: 'bg-red-500',      label: 'Failed',    badge: 'text-red-400 bg-red-500/10 border-red-500/30' },
  running:   { dot: 'bg-blue-400 animate-pulse', label: 'Running', badge: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  pending:   { dot: 'bg-yellow-400',   label: 'Pending',   badge: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  queued:    { dot: 'bg-slate-400',    label: 'Queued',    badge: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
  cancelled: { dot: 'bg-slate-500',    label: 'Cancelled', badge: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
};

const PROVIDER_BADGE: Record<PipelineProvider, { label: string; classes: string }> = {
  github: { label: 'GitHub', classes: 'bg-slate-700 text-slate-200' },
  azure:  { label: 'Azure',  classes: 'bg-blue-900/50 text-blue-300' },
  aws:    { label: 'AWS',    classes: 'bg-orange-900/40 text-orange-300' },
};

export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const project = mockProjects.find((p) => p.id === projectId);
  if (!project) {
    return (
      <div className="min-h-screen bg-signal-bg flex items-center justify-center text-signal-text-muted font-mono">
        Project not found.
      </div>
    );
  }

  const tasks = mockTasks.filter((t) => t.projectId === projectId);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const hoursThisWeek = project.hoursThisWeek ?? 0;

  const recentTasks = [...tasks]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  const pipelines = (mockPipelines[projectId ?? ''] ?? []).slice(0, 3);

  const now = new Date();
  const upcomingEvents = mockCalendarEvents
    .filter((e) => e.projectId === projectId && new Date(e.start) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 2);

  const stats = [
    { label: 'Total Tasks',   value: totalTasks,     icon: ListTodo,    color: 'text-signal-text' },
    { label: 'Completed',     value: completedTasks,  icon: CheckSquare, color: 'text-signal-green' },
    { label: 'In Progress',   value: inProgressTasks, icon: AlertCircle, color: 'text-blue-400' },
    { label: 'Hours / Week',  value: hoursThisWeek,   icon: Clock,       color: 'text-yellow-400' },
  ];

  const statusBadgeClass = project.status === 'active'
    ? 'bg-signal-green/10 text-signal-green border border-signal-green/30'
    : project.status === 'paused'
    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
    : project.status === 'completed'
    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
    : 'bg-slate-500/10 text-slate-400 border border-slate-500/30';

  function formatEventDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="min-h-screen bg-signal-bg text-signal-text font-mono p-6 space-y-6">

      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
          <h1 className="text-2xl font-bold text-signal-text">{project.name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusBadgeClass}`}>
            {project.status}
          </span>
        </div>
        {project.client_name && (
          <span className="text-signal-text-muted text-sm">{project.client_name}</span>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-signal-card border border-signal-border rounded-xl p-4 shadow-signal-card">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={color} />
              <span className="text-signal-text-dim text-xs">{label}</span>
            </div>
            <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Main grid: chart + activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Hours Area Chart */}
        <div className="xl:col-span-2 bg-signal-card border border-signal-border rounded-xl p-5 shadow-signal-card">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-signal-green" />
            <h2 className="text-signal-text font-semibold text-sm">Hours This Week</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hoursData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00FF41" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00FF41" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2a1a" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a1a0a',
                  border: '1px solid #1f2d1f',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  color: '#00FF41',
                }}
                labelStyle={{ color: '#9ca3af' }}
                cursor={{ stroke: '#00FF41', strokeWidth: 1, strokeDasharray: '4 2' }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#00FF41"
                strokeWidth={2}
                fill="url(#hoursGradient)"
                dot={{ fill: '#00FF41', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: '#00FF41', r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-signal-card border border-signal-border rounded-xl p-5 shadow-signal-card">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-signal-green" />
            <h2 className="text-signal-text font-semibold text-sm">Recent Activity</h2>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-signal-text-muted text-xs">No tasks yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentTasks.map((task) => (
                <li key={task.id} className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: task.projectColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-signal-text text-xs font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-xs ${STATUS_TASK_COLOR[task.status]}`}>
                        {STATUS_TASK_ICON[task.status]}
                      </span>
                      <span className="text-signal-text-muted text-xs capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom row: Pipelines + Events + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Pipelines */}
        <div className="bg-signal-card border border-signal-border rounded-xl p-5 shadow-signal-card">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch size={16} className="text-signal-green" />
            <h2 className="text-signal-text font-semibold text-sm">CI/CD Pipelines</h2>
          </div>
          {pipelines.length === 0 ? (
            <p className="text-signal-text-muted text-xs">No pipelines configured.</p>
          ) : (
            <ul className="space-y-3">
              {pipelines.map((pl) => {
                const st = PIPELINE_STATUS_STYLES[pl.status];
                const prov = PROVIDER_BADGE[pl.provider];
                const time = pl.timestamp
                  ? new Date(pl.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : '';
                return (
                  <li key={pl.id} className="flex items-center gap-3 p-2 bg-signal-surface rounded-lg">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-signal-text text-xs font-medium truncate">{pl.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${prov.classes}`}>
                          {prov.label}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${st.badge}`}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                    {time && (
                      <span className="text-signal-text-muted text-xs flex-shrink-0">{time}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-signal-card border border-signal-border rounded-xl p-5 shadow-signal-card">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={16} className="text-signal-green" />
            <h2 className="text-signal-text font-semibold text-sm">Upcoming Events</h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-signal-text-muted text-xs">No upcoming events for this project.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((ev) => (
                <li key={ev.id} className="flex items-start gap-3 p-2 bg-signal-surface rounded-lg">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: ev.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-signal-text text-xs font-medium truncate">{ev.title}</p>
                    <p className="text-signal-text-muted text-xs mt-0.5">{formatEventDate(new Date(ev.start))}</p>
                    {ev.description && (
                      <p className="text-signal-text-dim text-xs mt-0.5 line-clamp-1">{ev.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-signal-card border border-signal-border rounded-xl p-5 shadow-signal-card">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-signal-green" />
            <h2 className="text-signal-text font-semibold text-sm">Quick Actions</h2>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/app/p/${projectId}/boards`)}
              className="flex items-center gap-3 w-full bg-signal-surface border border-signal-border hover:border-signal-green/50 rounded-lg px-4 py-3 text-sm text-signal-text transition-colors group"
            >
              <Plus size={15} className="text-signal-green flex-shrink-0" />
              <span>New Task</span>
            </button>
            <button
              onClick={() => navigate(`/app/p/${projectId}/timesheet`)}
              className="flex items-center gap-3 w-full bg-signal-surface border border-signal-border hover:border-signal-green/50 rounded-lg px-4 py-3 text-sm text-signal-text transition-colors"
            >
              <Clock size={15} className="text-yellow-400 flex-shrink-0" />
              <span>Log Time</span>
            </button>
            <button
              onClick={() => navigate(`/app/p/${projectId}/invoices`)}
              className="flex items-center gap-3 w-full bg-signal-surface border border-signal-border hover:border-signal-green/50 rounded-lg px-4 py-3 text-sm text-signal-text transition-colors"
            >
              <FileText size={15} className="text-blue-400 flex-shrink-0" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
