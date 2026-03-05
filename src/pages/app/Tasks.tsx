import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List, Plus, X, Search } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { KanbanBoard } from '@/components/app/KanbanBoard';
import { mockProjects } from '@/lib/mock-data';
import type { Task, TaskPriority, TaskStatus } from '@/types';
import { format } from 'date-fns';

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-slate-700/60 text-slate-300',
  medium: 'bg-amber-900/40 text-amber-300',
  high: 'bg-orange-900/40 text-orange-300',
  urgent: 'bg-red-900/40 text-red-300',
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-slate-700 text-slate-300',
  in_progress: 'bg-primary-900/40 text-primary-300',
  review: 'bg-amber-900/40 text-amber-300',
  done: 'bg-accent-900/40 text-accent-300',
};

export function Tasks() {
  const { t } = useTranslation();
  const { tasks, addTask, updateTaskStatus } = useTasks();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium' as TaskPriority,
    projectId: 'p2', dueDate: '',
  });

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchProject = filterProject === 'all' || t.projectId === filterProject;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchSearch && matchProject && matchPriority;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const project = mockProjects.find((p) => p.id === form.projectId) || mockProjects[0];
    addTask({
      title: form.title,
      description: form.description,
      status: 'todo',
      priority: form.priority,
      projectId: project.id,
      projectName: project.name,
      projectColor: project.color,
      dueDate: form.dueDate || undefined,
      tags: [],
    });
    setForm({ title: '', description: '', priority: 'medium', projectId: 'p2', dueDate: '' });
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <h2 className="text-xl font-bold text-white flex-1">{t('tasks.title')}</h2>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder={t('app.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500 w-40"
            />
          </div>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none"
          >
            <option value="all">{t('tasks.allProjects')}</option>
            {mockProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none"
          >
            <option value="all">{t('tasks.allPriorities')}</option>
            {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => (
              <option key={p} value={p}>{t(`tasks.priority.${p}`)}</option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={15} /> {t('app.newTask')}
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        <KanbanBoard tasks={filtered} onStatusChange={updateTaskStatus} onAddTask={addTask} />
      ) : (
        <TaskList tasks={filtered} />
      )}

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
                <h3 className="text-white font-semibold">{t('tasks.newTask.title')}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t('tasks.newTask.taskTitle')}</label>
                  <input
                    required
                    placeholder={t('tasks.newTask.titlePlaceholder')}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t('tasks.newTask.description')}</label>
                  <textarea
                    rows={3}
                    placeholder={t('tasks.newTask.descPlaceholder')}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">{t('tasks.newTask.priority')}</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none"
                    >
                      {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => (
                        <option key={p} value={p}>{t(`tasks.priority.${p}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">{t('tasks.newTask.dueDate')}</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t('tasks.newTask.project')}</label>
                  <select
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none"
                  >
                    {mockProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
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

function TaskList({ tasks }: { tasks: Task[] }) {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {tasks.length === 0 ? (
        <div className="p-12 text-center text-slate-500">{t('app.noData')}</div>
      ) : (
        <div className="divide-y divide-slate-800">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/50 transition-colors">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.projectColor }} />
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate">{task.title}</p>
                <p className="text-slate-500 text-xs">{task.projectName}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${PRIORITY_STYLES[task.priority]}`}>
                {t(`tasks.priority.${task.priority}`)}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-md ${STATUS_STYLES[task.status]}`}>
                {t(`tasks.columns.${task.status}`)}
              </span>
              {task.dueDate && (
                <span className="text-slate-500 text-xs hidden sm:block">
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
