import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, X, Pin, Trash2 } from 'lucide-react';
import { mockNotes } from '@/lib/mock-data';
import type { Note, NoteColor } from '@/types';

const COLOR_MAP: Record<NoteColor, { bg: string; border: string; text: string }> = {
  yellow: { bg: 'bg-amber-300', border: 'border-amber-400', text: 'text-amber-950' },
  pink: { bg: 'bg-pink-300', border: 'border-pink-400', text: 'text-pink-950' },
  green: { bg: 'bg-emerald-300', border: 'border-emerald-400', text: 'text-emerald-950' },
  blue: { bg: 'bg-sky-300', border: 'border-sky-400', text: 'text-sky-950' },
  orange: { bg: 'bg-orange-300', border: 'border-orange-400', text: 'text-orange-950' },
};

const NOTE_COLORS: NoteColor[] = ['yellow', 'pink', 'green', 'blue', 'orange'];

export function Notes() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', color: 'yellow' as NoteColor });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: Note = {
      id: `n${Date.now()}`,
      title: form.title,
      content: form.content,
      color: form.color,
      pinned: false,
      posX: 80 + Math.random() * 200,
      posY: 80 + Math.random() * 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setForm({ title: '', content: '', color: 'yellow' });
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  };

  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">{t('notes.title')}</h2>
          <p className="text-slate-400 text-sm mt-0.5">{t('notes.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> {t('notes.newNote')}
        </button>
      </div>

      {/* Pinned */}
      {sorted.some((n) => n.pinned) && (
        <div className="mb-6">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Pin size={12} /> Pinned
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {sorted.filter((n) => n.pinned).map((note) => (
              <NoteCard key={note.id} note={note} onDelete={handleDelete} onTogglePin={handleTogglePin} />
            ))}
          </div>
        </div>
      )}

      {/* All notes */}
      <div>
        {sorted.some((n) => n.pinned) && (
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Others</h3>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sorted.filter((n) => !n.pinned).map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} onTogglePin={handleTogglePin} />
          ))}
        </div>
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
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold">{t('notes.newNote')}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <input
                    required
                    placeholder={t('notes.noteTitlePlaceholder')}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm font-medium"
                  />
                </div>
                <div>
                  <textarea
                    rows={4}
                    placeholder={t('notes.noteContentPlaceholder')}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Color</label>
                  <div className="flex gap-2">
                    {NOTE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        className={`w-7 h-7 rounded-full transition-all ${COLOR_MAP[c].bg} ${
                          form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">
                    {t('app.cancel')}
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-colors">
                    {t('app.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoteCard({
  note,
  onDelete,
  onTogglePin,
}: {
  note: Note;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { bg, text } = COLOR_MAP[note.color];
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(note.content);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02, rotate: 1, zIndex: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative ${bg} rounded-lg shadow-lg p-3 min-h-[140px] flex flex-col group cursor-default`}
    >
      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onTogglePin(note.id)}
          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
            note.pinned ? 'bg-black/20' : 'hover:bg-black/10'
          }`}
          title={note.pinned ? t('notes.unpin') : t('notes.pin')}
        >
          <Pin size={11} className={text} />
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/10 transition-colors"
          title={t('notes.deleteNote')}
        >
          <Trash2 size={11} className={text} />
        </button>
      </div>

      {/* Content */}
      <p className={`font-semibold text-sm mb-1 ${text} pr-12`}>{note.title}</p>
      {editing ? (
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => setEditing(false)}
          className={`flex-1 bg-transparent resize-none focus:outline-none text-xs ${text} leading-relaxed`}
        />
      ) : (
        <p
          onClick={() => setEditing(true)}
          className={`flex-1 text-xs ${text} leading-relaxed whitespace-pre-wrap cursor-text opacity-80`}
        >
          {content || '...'}
        </p>
      )}
    </motion.div>
  );
}
