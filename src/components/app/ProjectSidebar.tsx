import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Columns,
  GitBranch,
  Rocket,
  CalendarDays,
  StickyNote,
  Bot,
  KeyRound,
  TerminalSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  FileSignature,
  ArrowLeft,
} from 'lucide-react';
import type { Project } from '@/types';

interface Props {
  project: Project;
  collapsed: boolean;
  onToggle: () => void;
}

const projectNavItems = [
  { key: '', icon: LayoutDashboard, labelKey: 'app.overview' },
  { key: 'boards', icon: Columns, labelKey: 'app.boards' },
  { key: 'repos', icon: GitBranch, labelKey: 'app.repos' },
  { key: 'pipelines', icon: Rocket, labelKey: 'app.pipelines' },
  { key: 'calendar', icon: CalendarDays, labelKey: 'app.calendar' },
  { key: 'notes', icon: StickyNote, labelKey: 'app.notes' },
  { key: 'ai', icon: Bot, labelKey: 'app.aiChat' },
  { key: 'secrets', icon: KeyRound, labelKey: 'app.secrets' },
  { key: 'terminal', icon: TerminalSquare, labelKey: 'app.terminal' },
  { key: 'settings', icon: Settings, labelKey: 'app.projectSettings' },
];

const globalNavItems = [
  { path: '/app/timesheets', icon: Clock, labelKey: 'app.timesheets' },
  { path: '/app/invoices', icon: FileText, labelKey: 'app.invoices' },
  { path: '/app/contracts', icon: FileSignature, labelKey: 'app.contracts' },
];

export function ProjectSidebar({ project, collapsed, onToggle }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const base = `/app/p/${project.id}`;

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-52'} flex-shrink-0 bg-signal-surface border-r border-signal-border flex flex-col transition-all duration-200 overflow-hidden`}
    >
      {/* Project Header */}
      <div className={`flex items-center gap-2 px-3 py-3 border-b border-signal-border min-h-[52px] ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <>
            <button
              onClick={() => navigate('/app')}
              className="text-signal-text-muted hover:text-signal-green transition-colors flex-shrink-0"
              title="Back to projects"
            >
              <ArrowLeft size={14} />
            </button>
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-xs font-semibold text-signal-text truncate flex-1">{project.name}</span>
          </>
        )}
        {collapsed && (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: project.color }}
          />
        )}
      </div>

      {/* Project Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {projectNavItems.map((item) => {
          const to = item.key ? `${base}/${item.key}` : base;
          return (
            <NavLink
              key={item.key}
              to={to}
              end={item.key === ''}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-xs transition-colors ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'text-signal-green bg-signal-green-glow border-r-2 border-signal-green'
                    : 'text-signal-text-dim hover:text-signal-text hover:bg-signal-card'
                }`
              }
              title={collapsed ? t(item.labelKey, item.key) : undefined}
            >
              <item.icon size={15} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{t(item.labelKey, item.key)}</span>}
            </NavLink>
          );
        })}

        {/* Global separator */}
        <div className="my-2 mx-3 border-t border-signal-border" />

        {globalNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 text-xs transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'text-signal-green bg-signal-green-glow border-r-2 border-signal-green'
                  : 'text-signal-text-muted hover:text-signal-text-dim hover:bg-signal-card'
              }`
            }
            title={collapsed ? t(item.labelKey, item.path) : undefined}
          >
            <item.icon size={15} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{t(item.labelKey, item.path)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-signal-border text-signal-text-muted hover:text-signal-green transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
