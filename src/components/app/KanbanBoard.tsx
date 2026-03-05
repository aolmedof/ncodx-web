import { useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, X, GripVertical } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '@/types';
import { mockProjects } from '@/lib/mock-data';

const COLUMNS: { key: TaskStatus; color: string }[] = [
  { key: 'todo', color: 'border-slate-600' },
  { key: 'in_progress', color: 'border-primary-600' },
  { key: 'review', color: 'border-amber-500' },
  { key: 'done', color: 'border-accent-500' },
];

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-slate-700/60 text-slate-300',
  medium: 'bg-amber-900/40 text-amber-300',
  high: 'bg-orange-900/40 text-orange-300',
  urgent: 'bg-red-900/40 text-red-300',
};

interface Props {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  defaultProjectId?: string;
  defaultProjectName?: string;
  defaultProjectColor?: string;
}

export function KanbanBoard({ tasks, onStatusChange, onAddTask, defaultProjectId, defaultProjectName, defaultProjectColor }: Props) {
  const { t } = useTranslation();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [addingTo, setAddingTo] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (e: DragStartEvent) => {
    const task = tasks.find((t) => t.id === e.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveTask(null);
    if (!over) return;
    const taskId = active.id as string;
    const overId = over.id as string;
    const targetColumn = COLUMNS.find((c) => c.key === overId);
    if (targetColumn) {
      onStatusChange(taskId, targetColumn.key);
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && overTask.status !== tasks.find((t) => t.id === taskId)?.status) {
        onStatusChange(taskId, overTask.status);
      }
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    if (!newTaskTitle.trim()) return;
    const project = defaultProjectId
      ? { id: defaultProjectId, name: defaultProjectName || '', color: defaultProjectColor || '#2563eb' }
      : { id: 'p2', name: 'NCODX Platform', color: '#0d9488' };

    onAddTask({
      title: newTaskTitle.trim(),
      description: '',
      status,
      priority: 'medium',
      projectId: project.id,
      projectName: project.name,
      projectColor: project.color,
      tags: [],
    });
    setNewTaskTitle('');
    setAddingTo(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(({ key, color }) => {
          const columnTasks = tasks.filter((t) => t.status === key);
          return (
            <div
              key={key}
              id={key}
              className="flex-shrink-0 w-64"
            >
              <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden border-t-2 ${color}`}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{t(`tasks.columns.${key}`)}</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-md">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => { setAddingTo(key); setNewTaskTitle(''); }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <SortableContext items={columnTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="p-2 min-h-[200px] space-y-2">
                    {columnTasks.map((task) => (
                      <SortableTaskCard key={task.id} task={task} />
                    ))}

                    {/* Add task inline */}
                    <AnimatePresence>
                      {addingTo === key && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-slate-800 rounded-lg p-3"
                        >
                          <input
                            autoFocus
                            placeholder={t('tasks.newTask.titlePlaceholder')}
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddTask(key);
                              if (e.key === 'Escape') setAddingTo(null);
                            }}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md px-2 py-1.5 text-white text-sm focus:outline-none focus:border-primary-500 mb-2 placeholder-slate-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddTask(key)}
                              className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white text-xs rounded-md font-medium transition-colors"
                            >
                              {t('app.create')}
                            </button>
                            <button
                              onClick={() => setAddingTo(null)}
                              className="p-1 text-slate-400 hover:text-white transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              </div>
            </div>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard task={task} dragListeners={listeners} isDragging={isDragging} />
    </div>
  );
}

function TaskCard({ task, dragListeners, isDragging }: { task: Task; dragListeners?: object; isDragging?: boolean }) {
  const { t } = useTranslation();
  return (
    <div
      className={`bg-slate-800 border rounded-lg p-3 cursor-default transition-all ${
        isDragging ? 'opacity-50 scale-95 border-primary-500' : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          {...dragListeners}
          className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 mt-0.5 flex-shrink-0"
        >
          <GripVertical size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-200 text-sm font-medium leading-snug mb-2">{task.title}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_STYLES[task.priority]}`}>
              {t(`tasks.priority.${task.priority}`)}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: task.projectColor + '25', color: task.projectColor }}
            >
              {task.projectName}
            </span>
          </div>
          {task.dueDate && (
            <p className="text-slate-500 text-xs mt-1.5">{task.dueDate}</p>
          )}
        </div>
      </div>
    </div>
  );
}
