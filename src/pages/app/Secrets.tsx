import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, EyeOff, Copy, Trash2, X, KeyRound, Lock, Tag, Zap } from 'lucide-react';
import { mockSecrets } from '@/lib/mock-data';
import type { Secret, SecretCategory } from '@/types';

const CATEGORY_ICONS: Record<SecretCategory, typeof KeyRound> = {
  api_key: Zap,
  password: Lock,
  token: Tag,
  other: KeyRound,
};

const CATEGORY_COLORS: Record<SecretCategory, string> = {
  api_key: 'text-amber-400 bg-amber-900/30',
  password: 'text-red-400 bg-red-900/30',
  token: 'text-violet-400 bg-violet-900/30',
  other: 'text-slate-400 bg-slate-700/50',
};

export function Secrets() {
  const { t } = useTranslation();
  const [secrets, setSecrets] = useState<Secret[]>(mockSecrets);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    value: '',
    category: 'api_key' as SecretCategory,
    description: '',
  });
  const [filterCategory, setFilterCategory] = useState<'all' | SecretCategory>('all');

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = (id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newSecret: Secret = {
      id: `s${Date.now()}`,
      name: form.name,
      value: form.value,
      category: form.category,
      description: form.description || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSecrets((prev) => [newSecret, ...prev]);
    setForm({ name: '', value: '', category: 'api_key', description: '' });
    setShowModal(false);
  };

  const filtered = filterCategory === 'all' ? secrets : secrets.filter((s) => s.category === filterCategory);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{t('secrets.title')}</h2>
          <p className="text-slate-400 text-sm mt-0.5">{t('secrets.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as 'all' | SecretCategory)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none"
          >
            <option value="all">All Categories</option>
            {(['api_key', 'password', 'token', 'other'] as SecretCategory[]).map((c) => (
              <option key={c} value={c}>{t(`secrets.category.${c}`)}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> {t('app.newSecret')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((secret) => {
          const Icon = CATEGORY_ICONS[secret.category];
          const catColor = CATEGORY_COLORS[secret.category];
          const isRevealed = revealed.has(secret.id);

          return (
            <motion.div
              key={secret.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${catColor}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-white font-medium text-sm">{secret.name}</h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${catColor}`}>
                      {t(`secrets.category.${secret.category}`)}
                    </span>
                  </div>
                  {secret.description && (
                    <p className="text-slate-500 text-xs mb-2">{secret.description}</p>
                  )}
                  <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                    <code className="text-slate-300 text-xs font-mono flex-1 truncate">
                      {isRevealed ? secret.value : '•'.repeat(Math.min(secret.value.length, 32))}
                    </code>
                    <button
                      onClick={() => toggleReveal(secret.id)}
                      className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                      title={isRevealed ? t('secrets.hide') : t('secrets.show')}
                    >
                      {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => handleCopy(secret.id, secret.value)}
                      className={`transition-colors flex-shrink-0 ${
                        copied === secret.id ? 'text-accent-400' : 'text-slate-400 hover:text-white'
                      }`}
                      title={t('secrets.copy')}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  {copied === secret.id && (
                    <p className="text-accent-400 text-xs mt-1">{t('app.copied')}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(secret.id)}
                  className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold">{t('secrets.newSecret.title')}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t('secrets.newSecret.name')}</label>
                  <input required placeholder={t('secrets.newSecret.namePlaceholder')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t('secrets.newSecret.value')}</label>
                  <input required type="password" placeholder={t('secrets.newSecret.valuePlaceholder')} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t('secrets.newSecret.category')}</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as SecretCategory })} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none">
                    {(['api_key', 'password', 'token', 'other'] as SecretCategory[]).map((c) => (
                      <option key={c} value={c}>{t(`secrets.category.${c}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t('secrets.newSecret.description')}</label>
                  <input placeholder={t('secrets.newSecret.descPlaceholder')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">{t('app.cancel')}</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-colors">{t('app.create')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
