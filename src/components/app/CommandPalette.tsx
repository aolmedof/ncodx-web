import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, FolderOpen, Columns, GitBranch, Rocket, Clock, FileText, FileSignature, User, Settings, Terminal as TerminalIcon } from 'lucide-react';
import { mockProjects, mockTasks } from '@/lib/mock-data';

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
        setSelected(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const allItems: CommandItem[] = [
    // Projects
    ...mockProjects.map((p) => ({
      id: `proj-${p.id}`,
      label: p.name,
      sublabel: p.client_name,
      icon: <FolderOpen size={14} className="text-signal-green" />,
      action: () => go(`/app/p/${p.id}`),
      category: t('app.projects', 'Proyectos'),
    })),
    // Project sub-pages
    ...mockProjects.flatMap((p) => [
      { id: `boards-${p.id}`, label: `${p.name} → Boards`, icon: <Columns size={14} className="text-blue-400" />, action: () => go(`/app/p/${p.id}/boards`), category: t('app.boards', 'Boards') },
      { id: `repos-${p.id}`, label: `${p.name} → Repos`, icon: <GitBranch size={14} className="text-purple-400" />, action: () => go(`/app/p/${p.id}/repos`), category: 'Repos' },
      { id: `pipelines-${p.id}`, label: `${p.name} → Pipelines`, icon: <Rocket size={14} className="text-orange-400" />, action: () => go(`/app/p/${p.id}/pipelines`), category: 'Pipelines' },
      { id: `terminal-${p.id}`, label: `${p.name} → Terminal`, icon: <TerminalIcon size={14} className="text-signal-green" />, action: () => go(`/app/p/${p.id}/terminal`), category: 'Terminal' },
    ]),
    // Tasks
    ...mockTasks.map((task) => ({
      id: `task-${task.id}`,
      label: task.title,
      sublabel: task.projectName,
      icon: <div className="w-3 h-3 rounded-full" style={{ backgroundColor: task.projectColor }} />,
      action: () => go(`/app/p/${task.projectId}/boards`),
      category: t('app.tasks', 'Tareas'),
    })),
    // Global pages
    { id: 'timesheets', label: t('app.timesheets', 'Timesheets'), icon: <Clock size={14} className="text-teal-400" />, action: () => go('/app/timesheets'), category: 'Global' },
    { id: 'invoices', label: t('app.invoices', 'Invoices'), icon: <FileText size={14} className="text-yellow-400" />, action: () => go('/app/invoices'), category: 'Global' },
    { id: 'contracts', label: t('app.contracts', 'Contracts'), icon: <FileSignature size={14} className="text-pink-400" />, action: () => go('/app/contracts'), category: 'Global' },
    { id: 'profile', label: t('app.profile', 'Mi Perfil'), icon: <User size={14} className="text-signal-text-dim" />, action: () => go('/app/profile'), category: 'Global' },
    { id: 'settings', label: t('app.settings', 'Configuración'), icon: <Settings size={14} className="text-signal-text-dim" />, action: () => go('/app/settings'), category: 'Global' },
  ];

  const filtered = query
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        (item.sublabel ?? '').toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems.slice(0, 8);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && filtered[selected]) { filtered[selected].action(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, filtered, selected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl mx-4 bg-signal-card border border-signal-border rounded-lg shadow-signal-card overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-signal-border">
          <Search size={15} className="text-signal-text-muted flex-shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder={t('app.commandPlaceholder', 'Buscar proyectos, tareas, páginas...')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-signal-text placeholder-signal-text-muted text-sm focus:outline-none font-mono"
          />
          <kbd className="text-xs text-signal-text-muted bg-signal-surface px-1.5 py-0.5 rounded border border-signal-border">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-signal-text-muted text-sm">
              {t('app.noResults', 'Sin resultados para')} "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelected(idx)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  idx === selected ? 'bg-signal-surface text-signal-text' : 'text-signal-text-dim hover:bg-signal-surface'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="flex-1 min-w-0">
                  <div className="text-sm truncate">{item.label}</div>
                  {item.sublabel && <div className="text-xs text-signal-text-muted truncate">{item.sublabel}</div>}
                </span>
                <span className="text-xs text-signal-text-muted flex-shrink-0">{item.category}</span>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-signal-border flex items-center gap-4 text-xs text-signal-text-muted">
          <span>↑↓ {t('app.navigate', 'navegar')}</span>
          <span>↵ {t('app.select', 'seleccionar')}</span>
          <span>ESC {t('app.close', 'cerrar')}</span>
        </div>
      </div>
    </div>
  );
}
