import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, Clock, FileSignature, FileText, FolderGit2, Search, Settings, User,
} from 'lucide-react';
import { useProjects, useTasks } from '@/hooks/queries';
import { cn } from '@/components/ui';

interface Item {
  id: string;
  label: string;
  hint?: string;
  icon: typeof Search;
  to: string;
  color?: string;
}

const STATIC_ITEMS: Item[] = [
  { id: 'nav-projects',   label: 'All projects', icon: FolderGit2,    to: '/app' },
  { id: 'nav-timesheets', label: 'Timesheets',   icon: Clock,         to: '/app/timesheets' },
  { id: 'nav-invoices',   label: 'Invoices',     icon: FileText,      to: '/app/invoices' },
  { id: 'nav-contracts',  label: 'Contracts',    icon: FileSignature, to: '/app/contracts' },
  { id: 'nav-profile',    label: 'Profile',      icon: User,          to: '/app/profile' },
  { id: 'nav-settings',   label: 'Settings',     icon: Settings,      to: '/app/settings' },
];

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  // Only fetch once the palette has actually been opened.
  const { data: projects } = useProjects(undefined, { enabled: open });
  const { data: tasks } = useTasks(undefined, { enabled: open });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((wasOpen) => {
          // Opening always starts from a clean slate.
          if (!wasOpen) {
            setQuery('');
            setCursor(0);
          }
          return !wasOpen;
        });
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const items = useMemo(() => {
    const projectItems: Item[] = (projects ?? []).map((project) => ({
      id: `project-${project.id}`,
      label: project.name,
      hint: project.clientName ?? undefined,
      icon: FolderGit2,
      to: `/app/p/${project.id}`,
      color: project.color,
    }));

    const taskItems: Item[] = (tasks ?? []).slice(0, 40).map((task) => ({
      id: `task-${task.id}`,
      label: task.title,
      hint: task.status.replace('_', ' '),
      icon: CheckSquare,
      to: task.projectId ? `/app/p/${task.projectId}/boards` : '/app',
    }));

    const all = [...projectItems, ...STATIC_ITEMS, ...taskItems];
    const term = query.trim().toLowerCase();
    if (!term) return all.slice(0, 12);
    return all
      .filter((item) =>
        item.label.toLowerCase().includes(term) || (item.hint ?? '').toLowerCase().includes(term))
      .slice(0, 12);
  }, [projects, tasks, query]);

  function go(item: Item) {
    setOpen(false);
    navigate(item.to);
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && items[cursor]) {
      e.preventDefault();
      go(items[cursor]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center p-4 pt-[12vh]">
      <div className="fixed inset-0 animate-fade-in bg-black/70 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-lg animate-fade-up overflow-hidden rounded-xl border border-line-strong bg-surface shadow-modal"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search size={15} className="shrink-0 text-ink-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search projects, tasks and pages…"
            className="h-12 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <kbd className="rounded border border-line bg-raised px-1.5 py-0.5 text-[11px] text-ink-faint">esc</kbd>
        </div>

        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-ink-faint">No matches for “{query}”.</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1.5">
            {items.map((item, i) => (
              <li key={item.id}>
                <button
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => go(item)}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors',
                    i === cursor ? 'bg-raised' : 'hover:bg-raised/60',
                  )}
                >
                  {item.color ? (
                    <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  ) : (
                    <item.icon size={14} className="shrink-0 text-ink-faint" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{item.label}</span>
                  {item.hint && <span className="shrink-0 text-[12px] capitalize text-ink-faint">{item.hint}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
