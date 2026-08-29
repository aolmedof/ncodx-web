import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Bot, CalendarDays, ChevronLeft, ChevronRight, Clock, Columns,
  FileSignature, FileText, GitBranch, KeyRound, LayoutDashboard, Rocket,
  Settings, StickyNote, TerminalSquare,
} from 'lucide-react';
import { Skeleton, cn } from '@/components/ui';
import type { Project } from '@/types';

const PROJECT_NAV = [
  { key: '',          icon: LayoutDashboard, labelKey: 'app.overview',        fallback: 'Overview' },
  { key: 'boards',    icon: Columns,         labelKey: 'app.boards',          fallback: 'Boards' },
  { key: 'repos',     icon: GitBranch,       labelKey: 'app.repos',           fallback: 'Repos' },
  { key: 'pipelines', icon: Rocket,          labelKey: 'app.pipelines',       fallback: 'Pipelines' },
  { key: 'calendar',  icon: CalendarDays,    labelKey: 'app.calendar',        fallback: 'Calendar' },
  { key: 'notes',     icon: StickyNote,      labelKey: 'app.notes',           fallback: 'Notes' },
  { key: 'ai',        icon: Bot,             labelKey: 'app.aiChat',          fallback: 'Assistant' },
  { key: 'secrets',   icon: KeyRound,        labelKey: 'app.secrets',         fallback: 'Secrets' },
  { key: 'terminal',  icon: TerminalSquare,  labelKey: 'app.terminal',        fallback: 'Terminal' },
  { key: 'settings',  icon: Settings,        labelKey: 'app.projectSettings', fallback: 'Settings' },
];

const WORKSPACE_NAV = [
  { path: '/app/timesheets', icon: Clock,         labelKey: 'app.timesheets', fallback: 'Timesheets' },
  { path: '/app/invoices',   icon: FileText,      labelKey: 'app.invoices',   fallback: 'Invoices' },
  { path: '/app/contracts',  icon: FileSignature, labelKey: 'app.contracts',  fallback: 'Contracts' },
];

const linkClass = (collapsed: boolean) => ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative mx-2 flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] transition-colors',
    collapsed && 'justify-center px-0',
    isActive
      ? 'bg-brand-soft font-medium text-brand'
      : 'text-ink-dim hover:bg-raised hover:text-ink',
  );

export function ProjectSidebar({
  project,
  loading = false,
  collapsed,
  onToggle,
}: {
  project?: Project;
  loading?: boolean;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const base = `/app/p/${projectId}`;

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-[calc(100vh-3.25rem)] shrink-0 flex-col overflow-hidden',
        'border-r border-line bg-surface transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-[216px]',
      )}
    >
      <div
        className={cn(
          'flex min-h-[52px] items-center gap-2 border-b border-line px-3',
          collapsed && 'justify-center px-0',
        )}
      >
        {collapsed ? (
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: project?.color ?? 'var(--color-line-strong)' }}
          />
        ) : (
          <>
            <button
              onClick={() => navigate('/app')}
              title="All projects"
              aria-label="All projects"
              className="shrink-0 rounded p-1 text-ink-faint transition-colors hover:bg-raised hover:text-ink"
            >
              <ArrowLeft size={14} />
            </button>
            {loading ? (
              <Skeleton className="h-4 flex-1" />
            ) : (
              <>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: project?.color ?? 'var(--color-line-strong)' }}
                />
                <span className="flex-1 truncate text-[13px] font-medium text-ink">
                  {project?.name ?? 'Project'}
                </span>
              </>
            )}
          </>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto py-2">
        {PROJECT_NAV.map((item) => (
          <NavLink
            key={item.key}
            to={item.key ? `${base}/${item.key}` : base}
            end={item.key === ''}
            className={linkClass(collapsed)}
            title={collapsed ? t(item.labelKey, item.fallback) : undefined}
          >
            <item.icon size={15} className="shrink-0" />
            {!collapsed && <span className="truncate">{t(item.labelKey, item.fallback)}</span>}
          </NavLink>
        ))}

        <div className="!my-2.5 mx-4 border-t border-line" />
        {!collapsed && <p className="eyebrow px-4 pb-1 pt-0.5">Workspace</p>}

        {WORKSPACE_NAV.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={linkClass(collapsed)}
            title={collapsed ? t(item.labelKey, item.fallback) : undefined}
          >
            <item.icon size={15} className="shrink-0" />
            {!collapsed && <span className="truncate">{t(item.labelKey, item.fallback)}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="flex h-10 items-center justify-center border-t border-line text-ink-faint transition-colors hover:bg-raised hover:text-ink"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
