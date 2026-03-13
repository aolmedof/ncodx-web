import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Search, Filter, Plus, X, GripVertical, CalendarDays, User } from 'lucide-react';
import { mockTasks, mockProjects } from '@/lib/mock-data';
import type { Task, TaskStatus, TaskPriority } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Column {
  key: TaskStatus;
  label: string;
  topColor: string;
  countColor: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const COLUMNS: Column[] = [
  { key: 'todo',        label: 'Todo',        topColor: 'border-t-slate-500',   countColor: 'bg-slate-700 text-slate-300' },
  { key: 'in_progress', label: 'In Progress', topColor: 'border-t-blue-500',    countColor: 'bg-blue-900/50 text-blue-300' },
  { key: 'review',      label: 'Review',      topColor: 'border-t-yellow-500',  countColor: 'bg-yellow-900/50 text-yellow-300' },
  { key: 'done',        label: 'Done',        topColor: 'border-t-signal-green',countColor: 'bg-signal-green/10 text-signal-green' },
];

const PRIORITY_STRIPE: Record<TaskPriority, string> = {
  urgent: 'bg-red-500',
  high:   'bg-orange-400',
  medium: 'bg-yellow-400',
  low:    'bg-slate-500',
};

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  urgent: 'bg-red-500/10 text-red-400 border border-red-500/30',
  high:   'bg-orange-500/10 text-orange-400 border border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
  low:    'bg-slate-500/10 text-slate-400 border border-slate-500/30',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(/[\s.@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');
}

function formatDueDate(date?: string): string | null {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isDueSoon(date?: string): boolean {
  if (!date) return false;
  const diff = new Date(date).getTime() - Date.now();
  return diff >= 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

function isOverdue(date?: string): boolean {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

// ── Task Card ──────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  dragListeners,
  isDragging,
}: {
  task: Task;
  dragListeners?: Record<string, unknown>;
  isDragging?: boolean;
}) {
  const formattedDate = formatDueDate(task.dueDate);
  const soon = isDueSoon(task.dueDate);
  const overdue = isOverdue(task.dueDate);

  const dateColor = overdue
    ? 'text-red-400'
    : soon
    ? 'text-yellow-400'
    : 'text-signal-text-muted';

  return (
    <div
      className={`relative bg-signal-card border rounded-xl overflow-hidden transition-all select-none ${
        isDragging
          ? 'opacity-40 scale-95 border-signal-green/50 shadow-signal-card'
          : 'border-signal-border hover:border-signal-border-bright'
      }`}
    >
      {/* Priority left stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${PRIORITY_STRIPE[task.priority]}`} />

      <div className="pl-4 pr-3 py-3">
        {/* Drag handle + priority badge */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${PRIORITY_BADGE[task.priority]}`}>
            {task.priority}
          </span>
          <div
            {...dragListeners}
            className="cursor-grab active:cursor-grabbing text-signal-text-muted hover:text-signal-text transition-colors"
          >
            <GripVertical size={14} />
          </div>
        </div>

        {/* Title */}
        <p className="text-signal-text text-sm font-medium leading-snug mb-2">{task.title}</p>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded bg-signal-surface text-signal-text-dim border border-signal-border"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: assignee + due date */}
        <div className="flex items-center justify-between mt-1">
          {task.assignee ? (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-signal-bg text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: task.projectColor }}
              title={task.assignee}
            >
              {getInitials(task.assignee)}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-signal-border flex items-center justify-center">
              <User size={10} className="text-signal-text-muted" />
            </div>
          )}

          {formattedDate && (
            <div className={`flex items-center gap-1 text-xs ${dateColor}`}>
              <CalendarDays size={11} />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sortable Task Card ─────────────────────────────────────────────────────────

function SortableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard task={task} dragListeners={listeners} isDragging={isDragging} />
    </div>
  );
}

// ── Add Task Inline Form ───────────────────────────────────────────────────────

interface AddTaskFormProps {
  status: TaskStatus;
  projectId: string;
  projectName: string;
  projectColor: string;
  onAdd: (task: Task) => void;
  onCancel: () => void;
}

function AddTaskForm({ status, projectId, projectName, projectColor, onAdd, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  function handleSubmit() {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onAdd({
      id: `t-${Date.now()}`,
      title: title.trim(),
      description: '',
      status,
      priority,
      projectId,
      projectName,
      projectColor,
      tags: [],
      createdAt: now,
      updatedAt: now,
    });
    setTitle('');
  }

  return (
    <div className="bg-signal-surface border border-signal-green/30 rounded-xl p-3 space-y-2">
      <input
        autoFocus
        type="text"
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
        className="w-full bg-signal-card border border-signal-border rounded-lg px-3 py-1.5 text-sm text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green transition-colors"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as TaskPriority)}
        className="w-full bg-signal-card border border-signal-border rounded-lg px-3 py-1.5 text-xs text-signal-text focus:outline-none focus:border-signal-green transition-colors"
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
        <option value="urgent">Urgent</option>
      </select>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-signal-green text-signal-bg font-semibold text-xs py-1.5 rounded-lg hover:bg-signal-green/90 transition-colors"
        >
          Add Task
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 text-signal-text-muted hover:text-signal-text transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Droppable Column ───────────────────────────────────────────────────────────

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] space-y-2 p-2 rounded-lg transition-colors ${
        isOver ? 'bg-signal-green/5' : ''
      }`}
    >
      {children}
    </div>
  );
}

// ── Boards Page ────────────────────────────────────────────────────────────────

export default function Boards() {
  const { projectId } = useParams<{ projectId: string }>();

  const project = mockProjects.find((p) => p.id === projectId);

  const [tasks, setTasks] = useState<Task[]>(() =>
    mockTasks.filter((t) => t.projectId === projectId)
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [addingTo, setAddingTo] = useState<TaskStatus | null>(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const assignees = useMemo(() => {
    const names = tasks.map((t) => t.assignee).filter(Boolean) as string[];
    return Array.from(new Set(names));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        search === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchAssignee =
        assigneeFilter === 'all' ||
        (assigneeFilter === 'unassigned' ? !t.assignee : t.assignee === assigneeFilter);
      return matchSearch && matchPriority && matchAssignee;
    });
  }, [tasks, search, priorityFilter, assigneeFilter]);

  function handleDragStart(e: DragStartEvent) {
    const task = tasks.find((t) => t.id === e.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    const isColumn = COLUMNS.some((c) => c.key === overId);

    if (isColumn) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: overId as TaskStatus, updatedAt: new Date().toISOString() } : t
        )
      );
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        const draggedTask = tasks.find((t) => t.id === taskId);
        if (draggedTask && draggedTask.status !== overTask.status) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId
                ? { ...t, status: overTask.status, updatedAt: new Date().toISOString() }
                : t
            )
          );
        }
      }
    }
  }

  function handleAddTask(newTask: Task) {
    setTasks((prev) => [...prev, newTask]);
    setAddingTo(null);
  }

  function handleStatusChange(id: string, status: TaskStatus) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      )
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-signal-bg flex items-center justify-center text-signal-text-muted font-mono">
        Project not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-signal-bg text-signal-text font-mono flex flex-col">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 border-b border-signal-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
          <h1 className="text-lg font-bold text-signal-text">{project.name}</h1>
          <span className="text-signal-text-muted text-sm">/</span>
          <span className="text-signal-text-dim text-sm">Boards</span>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-signal-text-muted" />
            <input
              type="text"
              placeholder="Search tasks or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-signal-surface border border-signal-border rounded-lg pl-8 pr-3 py-2 text-sm text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green transition-colors"
            />
          </div>

          {/* Priority filter */}
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-signal-text-muted" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
              className="bg-signal-surface border border-signal-border rounded-lg pl-8 pr-3 py-2 text-sm text-signal-text focus:outline-none focus:border-signal-green transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-signal-surface border border-signal-border rounded-lg px-3 py-2 text-sm text-signal-text focus:outline-none focus:border-signal-green transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {assignees.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.key);
              return (
                <div key={col.key} className="w-72 flex flex-col">
                  <div
                    className={`bg-signal-card border border-signal-border rounded-xl overflow-hidden border-t-2 ${col.topColor} flex flex-col flex-1`}
                  >
                    {/* Column header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-signal-border">
                      <div className="flex items-center gap-2">
                        <span className="text-signal-text text-sm font-semibold">{col.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${col.countColor}`}>
                          {colTasks.length}
                        </span>
                      </div>
                      <button
                        onClick={() => setAddingTo(col.key)}
                        className="text-signal-text-muted hover:text-signal-green transition-colors"
                        title={`Add task to ${col.label}`}
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    {/* Sortable area + droppable */}
                    <SortableContext
                      items={colTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <DroppableColumn id={col.key}>
                        {colTasks.map((task) => (
                          <SortableTaskCard key={task.id} task={task} />
                        ))}

                        {/* Add task inline form */}
                        {addingTo === col.key && (
                          <AddTaskForm
                            status={col.key}
                            projectId={project.id}
                            projectName={project.name}
                            projectColor={project.color}
                            onAdd={handleAddTask}
                            onCancel={() => setAddingTo(null)}
                          />
                        )}

                        {/* Empty state */}
                        {colTasks.length === 0 && addingTo !== col.key && (
                          <div className="flex items-center justify-center h-16 text-signal-text-muted text-xs border border-dashed border-signal-border rounded-lg">
                            Drop tasks here
                          </div>
                        )}
                      </DroppableColumn>
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drag overlay */}
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isDragging={false} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
