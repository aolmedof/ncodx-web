import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Pin, Trash2, X, StickyNote } from 'lucide-react';
import { mockNotes, mockProjects } from '@/lib/mock-data';
import type { Note, NoteColor } from '@/types';

const COLOR_CLASSES: Record<NoteColor, { bg: string; border: string; text: string }> = {
  yellow: { bg: 'bg-yellow-950/40', border: 'border-yellow-700/40', text: 'text-yellow-200' },
  pink: { bg: 'bg-pink-950/40', border: 'border-pink-700/40', text: 'text-pink-200' },
  green: { bg: 'bg-green-950/40', border: 'border-green-700/40', text: 'text-green-200' },
  blue: { bg: 'bg-blue-950/40', border: 'border-blue-700/40', text: 'text-blue-200' },
  orange: { bg: 'bg-orange-950/40', border: 'border-orange-700/40', text: 'text-orange-200' },
};
const COLOR_DOT: Record<NoteColor, string> = {
  yellow: 'bg-yellow-400', pink: 'bg-pink-400', green: 'bg-green-400',
  blue: 'bg-blue-400', orange: 'bg-orange-400',
};
const COLORS: NoteColor[] = ['yellow', 'pink', 'green', 'blue', 'orange'];

export function Notes() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId?: string }>();
  const project = mockProjects.find((p) => p.id === projectId);
  const [notes, setNotes] = useState<Note[]>(
    projectId ? mockNotes.filter((n) => n.projectId === projectId) : mockNotes
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: '', content: '', color: 'yellow' as NoteColor });

  const openNew = () => {
    setEditNote(null);
    setForm({ title: '', content: '', color: 'yellow' });
    setModalOpen(true);
  };
  const openEdit = (note: Note) => {
    setEditNote(note);
    setForm({ title: note.title, content: note.content, color: note.color });
    setModalOpen(true);
  };

  const saveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (editNote) {
      setNotes((prev) => prev.map((n) => n.id === editNote.id ? { ...n, ...form, updatedAt: new Date().toISOString() } : n));
    } else {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        ...form,
        pinned: false,
        posX: Math.random() * 200,
        posY: Math.random() * 100,
        projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
    }
    setModalOpen(false);
  };

  const togglePin = (id: string) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };
  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const pinned = notes.filter((n) => n.pinned);
  const unpinned = notes.filter((n) => !n.pinned);

  return (
    <div className="p-6 bg-signal-bg min-h-full font-mono">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-signal-text-muted text-xs tracking-widest mb-1">
            {project ? `// ${project.name.toUpperCase()}` : '// GLOBAL'} NOTES
          </div>
          <h1 className="text-xl font-bold text-signal-text flex items-center gap-2">
            <StickyNote size={18} className="text-signal-green" />
            {t('notes.title', 'Notas')}
          </h1>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-3 py-2 bg-signal-green hover:bg-signal-green-dim text-signal-bg font-bold text-xs rounded transition-colors">
          <Plus size={13} />
          {t('notes.add', 'Nueva Nota')}
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20 text-signal-text-muted text-sm">
          <StickyNote size={40} className="mx-auto mb-4 opacity-20" />
          {t('notes.empty', 'No hay notas. Crea una.')}
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div className="mb-6">
              <div className="text-xs text-signal-text-muted tracking-widest mb-3 flex items-center gap-2">
                <Pin size={11} /> {t('notes.pinned', 'FIJADAS')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pinned.map((note) => <NoteCard key={note.id} note={note} onEdit={openEdit} onTogglePin={togglePin} onDelete={deleteNote} />)}
              </div>
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && <div className="text-xs text-signal-text-muted tracking-widest mb-3">{t('notes.others', 'OTRAS')}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {unpinned.map((note) => <NoteCard key={note.id} note={note} onEdit={openEdit} onTogglePin={togglePin} onDelete={deleteNote} />)}
              </div>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-signal-card border border-signal-border rounded w-full max-w-md mx-4 p-6 shadow-signal-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-signal-text">{editNote ? t('notes.edit', 'Editar Nota') : t('notes.add', 'Nueva Nota')}</h2>
              <button onClick={() => setModalOpen(false)} className="text-signal-text-muted hover:text-signal-text"><X size={16} /></button>
            </div>
            <form onSubmit={saveNote} className="space-y-4">
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 uppercase tracking-wider">{t('notes.noteTitle', 'Título')}</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título de la nota"
                  className="w-full px-3 py-2 bg-signal-surface border border-signal-border text-signal-text text-sm rounded focus:outline-none focus:border-signal-green transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 uppercase tracking-wider">{t('notes.content', 'Contenido')}</label>
                <textarea required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Escribe aquí..."
                  className="w-full px-3 py-2 bg-signal-surface border border-signal-border text-signal-text text-sm rounded focus:outline-none focus:border-signal-green transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-xs text-signal-text-dim mb-2 uppercase tracking-wider">{t('notes.color', 'Color')}</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className={`w-7 h-7 rounded-full ${COLOR_DOT[c]} ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-signal-card' : 'opacity-60 hover:opacity-100'} transition-all`} />
                  ))}
                </div>
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

function NoteCard({ note, onEdit, onTogglePin, onDelete }: {
  note: Note;
  onEdit: (n: Note) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const colors = COLOR_CLASSES[note.color];
  return (
    <div className={`group relative rounded border ${colors.bg} ${colors.border} p-4 cursor-pointer hover:scale-[1.02] transition-transform`} onClick={() => onEdit(note)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className={`text-sm font-semibold ${colors.text} truncate flex-1`}>{note.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onTogglePin(note.id)}
            className={`p-1 rounded hover:bg-black/20 transition-colors ${note.pinned ? colors.text : 'text-signal-text-muted'}`}>
            <Pin size={11} />
          </button>
          <button onClick={() => onDelete(note.id)} className="p-1 rounded hover:bg-black/20 text-signal-text-muted hover:text-red-400 transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      <p className="text-xs text-signal-text-dim whitespace-pre-wrap line-clamp-6 leading-relaxed">{note.content}</p>
      <div className="mt-3 text-xs text-signal-text-muted">
        {new Date(note.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
