import { useMemo, useState } from 'react';
import { Pin, PinOff, Plus, StickyNote, Trash2 } from 'lucide-react';
import {
  Button, Card, EmptyState, ErrorState, Field, Input, Modal, PageHeader,
  PageShell, SearchInput, Skeleton, Textarea,
} from '@/components/ui';
import { notesResource, useNotes } from '@/hooks/queries';
import { formatRelative } from '@/lib/format';
import type { Note } from '@/types';

const SWATCHES = ['#e3b341', '#3ecf8e', '#58a6ff', '#f2666b', '#a855f7', '#9ea3ab'];

export function Notes() {
  const { data, isPending, isError, error, refetch } = useNotes();
  const createNote = notesResource.useCreate();
  const updateNote = notesResource.useUpdate();
  const removeNote = notesResource.useRemove();

  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Note | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', color: SWATCHES[0] });

  const notes = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data ?? [])
      .filter((n) => !term || n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term))
      .sort((a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [data, query]);

  function startCreate() {
    setEditing(null);
    setForm({ title: '', content: '', color: SWATCHES[0] });
    setOpen(true);
  }

  function startEdit(note: Note) {
    setEditing(note);
    setForm({ title: note.title, content: note.content, color: note.color });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = { title: form.title.trim(), content: form.content, color: form.color };
    if (editing) await updateNote.mutateAsync({ id: editing.id, ...payload });
    else await createNote.mutateAsync({ ...payload, pinned: false, posX: 0, posY: 0 });
    setOpen(false);
  }

  return (
    <PageShell>
      <PageHeader
        title="Notes"
        description="Scratchpad for decisions, follow-ups and reminders."
        actions={<Button variant="primary" onClick={startCreate}><Plus size={15} />New note</Button>}
      />

      <div className="mt-5">
        <div className="w-full sm:w-72">
          <SearchInput value={query} onChange={setQuery} placeholder="Search notes…" />
        </div>
      </div>

      <div className="mt-4">
        {isPending ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : isError ? (
          <Card><ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} /></Card>
        ) : notes.length === 0 ? (
          <Card>
            <EmptyState
              icon={StickyNote}
              title={data?.length ? 'No notes match' : 'No notes yet'}
              description={data?.length ? 'Try a different search.' : 'Jot down anything you need to remember.'}
              action={<Button size="sm" variant="primary" onClick={startCreate}><Plus size={14} />New note</Button>}
            />
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <Card key={note.id} className="group relative overflow-hidden p-4">
                {/* Colour is decorative here, so it rides a spine rather than the text */}
                <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: note.color }} />
                <div className="flex items-start gap-2 pl-2">
                  <button onClick={() => startEdit(note)} className="min-w-0 flex-1 text-left">
                    <p className="truncate font-medium text-ink">{note.title}</p>
                  </button>
                  <button
                    onClick={() => updateNote.mutate({ id: note.id, pinned: !note.pinned })}
                    aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                    className={
                      'shrink-0 rounded p-1 transition ' +
                      (note.pinned ? 'text-brand' : 'text-ink-faint opacity-0 group-hover:opacity-100 hover:text-ink')
                    }
                  >
                    {note.pinned ? <Pin size={13} /> : <PinOff size={13} />}
                  </button>
                </div>
                <p className="mt-2 line-clamp-5 whitespace-pre-wrap pl-2 text-[13px] leading-relaxed text-ink-dim">
                  {note.content}
                </p>
                <div className="mt-3 flex items-center justify-between pl-2 text-[12px] text-ink-faint">
                  <span>{formatRelative(note.updatedAt)}</span>
                  <button
                    onClick={() => removeNote.mutate(note.id)}
                    aria-label="Delete note"
                    className="rounded p-1 opacity-0 transition hover:bg-critical-soft hover:text-critical group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit note' : 'New note'}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="note-form"
              loading={createNote.isPending || updateNote.isPending} disabled={!form.title.trim()}>
              {editing ? 'Save' : 'Create note'}
            </Button>
          </>
        }
      >
        <form id="note-form" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" required htmlFor="n-title">
            <Input id="n-title" autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Content" htmlFor="n-content">
            <Textarea id="n-content" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </Field>
          <Field label="Colour">
            <div className="flex gap-2">
              {SWATCHES.map((color) => (
                <button
                  key={color} type="button" aria-label={`Colour ${color}`}
                  onClick={() => setForm({ ...form, color })}
                  style={{ backgroundColor: color }}
                  className={'h-7 w-7 rounded-full transition-transform ' +
                    (form.color === color ? 'ring-2 ring-brand ring-offset-2 ring-offset-surface' : 'hover:scale-110')}
                />
              ))}
            </div>
          </Field>
        </form>
      </Modal>
    </PageShell>
  );
}
