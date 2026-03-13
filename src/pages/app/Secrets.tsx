import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Key, Eye, EyeOff, Copy, Plus, Trash2, Search, X, Check, Shield } from 'lucide-react';
import { mockSecrets, mockProjects } from '@/lib/mock-data';
import type { Secret, SecretCategory } from '@/types';

const CATEGORY_COLORS: Record<SecretCategory, string> = {
  api_key: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  password: 'text-red-400 bg-red-400/10 border-red-400/20',
  token: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  other: 'text-signal-text-dim bg-signal-card border-signal-border',
};
const CATEGORY_LABELS: Record<SecretCategory, string> = {
  api_key: 'API Key', password: 'Password', token: 'Token', other: 'Other',
};

export function Secrets() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId?: string }>();
  const project = mockProjects.find((p) => p.id === projectId);
  const [secrets, setSecrets] = useState<Secret[]>(
    projectId ? mockSecrets.filter((s) => s.projectId === projectId) : mockSecrets
  );
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SecretCategory | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', value: '', category: 'api_key' as SecretCategory, description: '' });

  const toggleVisible = (id: string) => {
    setVisible((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const copyValue = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteSecret = (id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  };

  const addSecret = (e: React.FormEvent) => {
    e.preventDefault();
    const newSecret: Secret = {
      id: `sec-${Date.now()}`,
      ...form,
      projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSecrets((prev) => [newSecret, ...prev]);
    setModalOpen(false);
    setForm({ name: '', value: '', category: 'api_key', description: '' });
  };

  const filtered = secrets.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || (s.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 bg-signal-bg min-h-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-signal-text-muted text-xs tracking-widest mb-1">
            {project ? `// ${project.name.toUpperCase()}` : '// GLOBAL'} SECRETS
          </div>
          <h1 className="text-xl font-bold text-signal-text flex items-center gap-2">
            <Shield size={18} className="text-signal-green" />
            {t('secrets.title', 'Secretos')}
          </h1>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-signal-green hover:bg-signal-green-dim text-signal-bg font-bold text-xs rounded transition-colors">
          <Plus size={13} />
          {t('secrets.add', 'Nuevo Secreto')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-signal-text-muted" />
          <input type="text" placeholder={t('app.search', 'Buscar...')} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-signal-card border border-signal-border text-signal-text placeholder-signal-text-muted text-xs rounded focus:outline-none focus:border-signal-green transition-colors" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as SecretCategory | 'all')}
          className="bg-signal-card border border-signal-border text-signal-text-dim text-xs rounded px-3 py-2 focus:outline-none focus:border-signal-green transition-colors">
          <option value="all">{t('secrets.allCategories', 'Todas las categorías')}</option>
          {(Object.keys(CATEGORY_LABELS) as SecretCategory[]).map((cat) => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
      </div>

      {/* Secrets list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-signal-text-muted text-sm">
            <Key size={32} className="mx-auto mb-3 opacity-20" />
            {t('secrets.empty', 'No hay secretos almacenados')}
          </div>
        ) : filtered.map((secret) => (
          <div key={secret.id} className="bg-signal-card border border-signal-border rounded flex items-center gap-4 px-4 py-3 hover:border-signal-border-bright transition-colors">
            <Key size={14} className="text-signal-text-muted flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-signal-text truncate">{secret.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[secret.category]}`}>
                  {CATEGORY_LABELS[secret.category]}
                </span>
              </div>
              {secret.description && (
                <div className="text-xs text-signal-text-muted truncate">{secret.description}</div>
              )}
            </div>
            <div className="font-mono text-xs text-signal-text-dim bg-signal-surface border border-signal-border rounded px-3 py-1.5 min-w-0 max-w-xs truncate">
              {visible.has(secret.id) ? secret.value : '•'.repeat(Math.min(secret.value.length, 24))}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => toggleVisible(secret.id)} title={visible.has(secret.id) ? 'Hide' : 'Show'}
                className="p-1.5 text-signal-text-muted hover:text-signal-text transition-colors rounded hover:bg-signal-surface">
                {visible.has(secret.id) ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button onClick={() => copyValue(secret.id, secret.value)} title="Copy"
                className="p-1.5 text-signal-text-muted hover:text-signal-green transition-colors rounded hover:bg-signal-surface">
                {copied === secret.id ? <Check size={13} className="text-signal-green" /> : <Copy size={13} />}
              </button>
              <button onClick={() => deleteSecret(secret.id)} title="Delete"
                className="p-1.5 text-signal-text-muted hover:text-red-400 transition-colors rounded hover:bg-signal-surface">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-signal-card border border-signal-border rounded w-full max-w-md mx-4 p-6 shadow-signal-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-signal-text-muted text-xs tracking-widest mb-0.5">// NUEVO</div>
                <h2 className="text-lg font-bold text-signal-text">{t('secrets.add', 'Nuevo Secreto')}</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-signal-text-muted hover:text-signal-text"><X size={16} /></button>
            </div>
            <form onSubmit={addSecret} className="space-y-4">
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 uppercase tracking-wider">{t('secrets.name', 'Nombre')}</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="MY_SECRET_KEY"
                  className="w-full px-3 py-2 bg-signal-surface border border-signal-border text-signal-text text-sm rounded focus:outline-none focus:border-signal-green transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 uppercase tracking-wider">{t('secrets.value', 'Valor')}</label>
                <input required type="password" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="••••••••"
                  className="w-full px-3 py-2 bg-signal-surface border border-signal-border text-signal-text text-sm rounded focus:outline-none focus:border-signal-green transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 uppercase tracking-wider">{t('secrets.category', 'Categoría')}</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as SecretCategory })}
                  className="w-full px-3 py-2 bg-signal-surface border border-signal-border text-signal-text text-sm rounded focus:outline-none focus:border-signal-green transition-colors">
                  {(Object.keys(CATEGORY_LABELS) as SecretCategory[]).map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 uppercase tracking-wider">{t('secrets.description', 'Descripción (opcional)')}</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción del secreto"
                  className="w-full px-3 py-2 bg-signal-surface border border-signal-border text-signal-text text-sm rounded focus:outline-none focus:border-signal-green transition-colors" />
              </div>
              <button type="submit" className="w-full px-4 py-2.5 bg-signal-green hover:bg-signal-green-dim text-signal-bg font-bold text-sm rounded transition-colors">
                {t('app.save', 'Guardar')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
