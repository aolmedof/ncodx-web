import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, X, FolderKanban } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import type { Project } from '@/types';

const PROJECT_COLORS = ['#2563eb', '#0d9488', '#7c3aed', '#dc2626', '#d97706', '#059669', '#0891b2', '#db2777'];
const STATUS_COLORS = {
  active: 'bg-accent-900/40 text-accent-300',
  paused: 'bg-amber-900/40 text-amber-300',
  completed: 'bg-primary-900/40 text-primary-300',
  archived: 'bg-slate-700 text-slate-400',
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">{t('projects.title')}</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> {t('app.newProject')}
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
                <h3 className="text-white font-semibold">{t('projects.newProject.title')}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t('projects.newProject.name')}</label>
                  <input
                    required
                    placeholder={t('projects.newProject.namePlaceholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t('projects.newProject.description')}</label>
                  <textarea
                    rows={3}
                    placeholder={t('projects.newProject.descPlaceholder')}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">{t('projects.newProject.color')}</label>
                  <div className="flex gap-2 flex-wrap">
                    {PROJECT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t('projects.newProject.dueDate')}</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('app.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-colors"
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
    <motion.div variants={item} whileHover={{ y: -4 }}>
      <Link
        to={`/app/projects/${project.id}`}
        className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all duration-200 group"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: project.color + '30' }}
            >
              <FolderKanban size={18} style={{ color: project.color }} />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm group-hover:text-primary-300 transition-colors">
                {project.name}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${STATUS_COLORS[project.status]}`}>
                {t(`projects.status.${project.status}`)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">{project.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{project.completedTaskCount}/{project.taskCount} {t('projects.tasks')}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: project.color }}
            />
          </div>
        </div>

        {project.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-3">
            {project.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
