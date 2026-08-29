import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable,
  useSensor, useSensors, type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { Plus, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Badge, Button, ErrorState, Field, Input, Modal, PageHeader, PageShell,
  Select, Skeleton, Textarea, cn, type Tone,
} from '@/components/ui';
import { tasksResource, useTasks } from '@/hooks/queries';
import { formatDateShort } from '@/lib/format';
import type { Task, TaskPriority, TaskStatus } from '@/types';

const COLUMNS: Array<{ id: TaskStatus; label: string; accent: string }> = [
  { id: 'todo',        label: 'To do',       accent: 'var(--color-stage-1)' },
  { id: 'in_progress', label: 'In progress', accent: 'var(--color-stage-2)' },
  { id: 'review',      label: 'In review',   accent: 'var(--color-stage-3)' },
  { id: 'done',        label: 'Done',        accent: 'var(--color-stage-4)' },
];

const PRIORITY_TONE: Record<TaskPriority, Tone> = {
  urgent: 'critical', high: 'caution', medium: 'info', low: 'neutral',
};

function TaskCard({ task, dragging = false }: { task: Task; dragging?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-md border border-line bg-card p-3 transition-colors',
        dragging ? 'rotate-1 border-brand-line shadow-popover' : 'hover:border-line-strong',
      )}
    >
      <p className="text-[13px] leading-snug text-ink">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-faint">
          {task.description}
        </p>
      )}
      <div className="mt-2.5 flex items-center gap-2">
        <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
        {task.dueDate && (
          <span className="text-[12px] text-ink-faint">{formatDateShort(task.dueDate)}</span>
        )}
      </div>
    </div>
  );
}

function DraggableTask({ task, onDelete }: { task: Task; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });

  return (
    <div ref={setNodeRef} className={cn('group relative', isDragging && 'opacity-40')}>
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing"
        aria-label={`Drag ${task.title}`}
      >
        <TaskCard task={task} />
      </div>
      <button
        onClick={() => onDelete(task.id)}
        aria-label={`Delete ${task.title}`}
        className={
          'absolute right-1.5 top-1.5 rounded p-1 text-ink-faint opacity-0 transition ' +
          'hover:bg-critical-soft hover:text-critical group-hover:opacity-100'
        }
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function Column({
  column, tasks, onDelete, onAdd,
}: {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  onDelete: (id: string) => void;
  onAdd: (status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex min-w-[268px] flex-1 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span aria-hidden className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: column.accent }} />
        <span className="text-[13px] font-medium text-ink">{column.label}</span>
        <span className="rounded-full bg-raised px-1.5 text-[12px] text-ink-faint tabular">
          {tasks.length}
        </span>
        <button
          onClick={() => onAdd(column.id)}
          aria-label={`Add task to ${column.label}`}
          className="ml-auto rounded p-1 text-ink-faint transition-colors hover:bg-raised hover:text-ink"
        >
          <Plus size={14} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-40 flex-1 flex-col gap-2 rounded-lg border border-dashed p-2 transition-colors',
          isOver ? 'border-brand-line bg-brand-soft' : 'border-line bg-surface/40',
        )}
      >
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <p className="px-1 py-6 text-center text-[12px] text-ink-faint">
            Drop tasks here
          </p>
        )}
      </div>
    </div>
  );
}

export default function Boards() {
  const { projectId } = useParams<{ projectId: string }>();
  const qc = useQueryClient();
  const { data, isPending, isError, error, refetch } = useTasks({ project_id: projectId });
  const updateTask = tasksResource.useUpdate();
  const createTask = tasksResource.useCreate();
  const removeTask = tasksResource.useRemove();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [composing, setComposing] = useState<TaskStatus | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as TaskPriority });

  // A small drag threshold keeps the delete button clickable.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const tasks = useMemo(() => data ?? [], [data]);
  const byStatus = useMemo(() => {
    const groups = new Map<TaskStatus, Task[]>(COLUMNS.map((c) => [c.id, []]));
    for (const task of tasks) groups.get(task.status)?.push(task);
    for (const list of groups.values()) list.sort((a, b) => a.position - b.position);
    return groups;
  }, [tasks]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const taskId = String(event.active.id);
    const target = event.over?.id as TaskStatus | undefined;
    const task = tasks.find((t) => t.id === taskId);
    if (!target || !task || task.status === target) return;

    // Optimistic: the card lands in the new column immediately, and the
    // resource-wide invalidation on settle reconciles with the server.
    qc.setQueryData<Task[]>(['tasks', 'list', { project_id: projectId }], (prev) =>
      prev?.map((t) => (t.id === taskId ? { ...t, status: target } : t)),
    );
    updateTask.mutate({ id: taskId, status: target });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !composing) return;
    await createTask.mutateAsync({
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: composing,
      priority: form.priority,
      projectId: projectId ?? null,
      position: byStatus.get(composing)?.length ?? 0,
    });
    setComposing(null);
    setForm({ title: '', description: '', priority: 'medium' });
  }

  return (
    <PageShell>
      <PageHeader
        title="Board"
        description="Drag a card to move it between columns."
        actions={
          <Button variant="primary" onClick={() => setComposing('todo')}>
            <Plus size={15} />
            New task
          </Button>
        }
      />

      {isPending ? (
        <div className="mt-5 flex gap-3 overflow-x-auto">
          {COLUMNS.map((c) => <Skeleton key={c.id} className="h-72 min-w-[268px] flex-1" />)}
        </div>
      ) : isError ? (
        <ErrorState
          className="mt-6"
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="mt-5 flex gap-3 overflow-x-auto pb-4">
            {COLUMNS.map((column) => (
              <Column
                key={column.id}
                column={column}
                tasks={byStatus.get(column.id) ?? []}
                onDelete={(id) => removeTask.mutate(id)}
                onAdd={setComposing}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <div className="w-[252px] cursor-grabbing">
                <TaskCard task={activeTask} dragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Modal
        open={composing !== null}
        onClose={() => setComposing(null)}
        title="New task"
        description={composing ? `Adds to ${COLUMNS.find((c) => c.id === composing)?.label}.` : undefined}
        footer={
          <>
            <Button onClick={() => setComposing(null)}>Cancel</Button>
            <Button
              variant="primary"
              type="submit"
              form="new-task"
              loading={createTask.isPending}
              disabled={!form.title.trim()}
            >
              Add task
            </Button>
          </>
        }
      >
        <form id="new-task" onSubmit={handleCreate} className="space-y-4">
          <Field label="Title" required htmlFor="nt-title">
            <Input
              id="nt-title"
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Wire up the payments endpoint"
            />
          </Field>
          <Field label="Description" htmlFor="nt-desc">
            <Textarea
              id="nt-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Priority" htmlFor="nt-priority">
            <Select
              id="nt-priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </Field>
        </form>
      </Modal>
    </PageShell>
  );
}
