import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, X, FolderKanban } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import type { Project } from '@/types';

const PROJECT_COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#dc2626', '#d97706', '#059669', '#0891b2', '#db2777'];
const STATUS_COLORS = {
  active: 'text-signal-green border border-signal-green/40',
  paused: 'text-amber-400 border border-amber-700/40',
  completed: 'text-signal-text-dim border border-signal-border-bright',
  archived: 'text-signal-text-muted border border-signal-border',
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
};

export function Projects() {
  const { t } = useTranslation();
  const { projects, addProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0], dueDate: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addProject({
      name: form.name,
      description: form.description,
      color: form.color,
      status: 'active',
      dueDate: form.dueDate || undefined,
      tags: [],
    });
    setForm({ name: '', description: '', color: PROJECT_COLORS[0], dueDate: '' });
    setShowModal(false);
  };

  return (
    <div className="p-6 bg-signal-bg min-h-full font-mono">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-signal-text-muted text-xs tracking-widest mb-1">// PROYECTOS</div>
          <h2 className="text-xl font-bold text-signal-text">{t('projects.title')}</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-signal-green hover:opacity-90 text-signal-bg rounded text-xs font-bold transition-opacity"
        >
          <Plus size={14} /> {t('app.newProject')}
        </button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-signal-card border border-signal-border rounded p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-signal-text font-semibold font-mono text-sm">
                  {t('projects.newProject.title')}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-signal-text-muted hover:text-signal-text transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs text-signal-text-dim uppercase tracking-wider mb-1.5">
                    {t('projects.newProject.name')}
                  </label>
                  <input
                    required
                    placeholder={t('projects.newProject.namePlaceholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-signal-surface border border-signal-border rounded text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green text-sm font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-signal-text-dim uppercase tracking-wider mb-1.5">
                    {t('projects.newProject.description')}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={t('projects.newProject.descPlaceholder')}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-signal-surface border border-signal-border rounded text-signal-text placeholder-signal-text-muted focus:outline-none focus:border-signal-green text-sm font-mono resize-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-signal-text-dim uppercase tracking-wider mb-2">
                    {t('projects.newProject.color')}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PROJECT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        className={`w-6 h-6 rounded transition-all ${form.color === c ? 'ring-2 ring-signal-green ring-offset-2 ring-offset-signal-card' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-signal-text-dim uppercase tracking-wider mb-1.5">
                    {t('projects.newProject.dueDate')}
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-signal-surface border border-signal-border rounded text-signal-text focus:outline-none focus:border-signal-green text-sm font-mono transition-colors"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-signal-surface hover:bg-signal-bg border border-signal-border text-signal-text-dim rounded text-xs font-medium transition-colors"
                  >
                    {t('app.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-signal-green hover:opacity-90 text-signal-bg rounded text-xs font-bold transition-opacity"
                  >
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

function ProjectCard({ project }: { project: Project }) {
  const { t } = useTranslation();
  const progress = project.taskCount > 0 ? (project.completedTaskCount / project.taskCount) * 100 : 0;

  return (
    <motion.div variants={item} whileHover={{ y: -3 }}>
      <Link
        to={`/app/p/${project.id}`}
        className="block bg-signal-card border border-signal-border hover:border-signal-border-bright rounded p-5 transition-all duration-200 group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded flex items-center justify-center"
              style={{ backgroundColor: project.color + '22' }}
            >
              <FolderKanban size={16} style={{ color: project.color }} />
            </div>
            <div>
              <h3 className="text-signal-text font-semibold text-sm group-hover:text-signal-green transition-colors">
                {project.name}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[project.status]}`}>
                {t(`projects.status.${project.status}`)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-signal-text-muted text-xs leading-relaxed mb-4 line-clamp-2">{project.description}</p>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-signal-text-muted">
            <span>{project.completedTaskCount}/{project.taskCount} {t('projects.tasks')}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-signal-bg rounded-full h-1">
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: project.color }}
            />
          </div>
        </div>

        {project.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-3">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-signal-surface border border-signal-border text-signal-text-muted rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
