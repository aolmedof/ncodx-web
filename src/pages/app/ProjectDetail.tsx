import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { mockProjects } from '@/lib/mock-data';
import { useTasks } from '@/hooks/useTasks';
import { KanbanBoard } from '@/components/app/KanbanBoard';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const project = mockProjects.find((p) => p.id === id);
  const { tasks, updateTaskStatus, addTask } = useTasks(id);

  if (!project) {
    return (
      <div className="p-6 text-slate-400">
        Project not found.{' '}
        <Link to="/app/projects" className="text-primary-400 hover:underline">
          {t('projects.detail.backToProjects')}
        </Link>
      </div>
    );
  }

  const progress = project.taskCount > 0 ? (project.completedTaskCount / project.taskCount) * 100 : 0;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/app/projects"
          className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={15} /> {t('projects.detail.backToProjects')}
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: project.color }}
          />
          <h2 className="text-xl font-bold text-white">{project.name}</h2>
        </div>
        <p className="text-slate-400 text-sm mb-4">{project.description}</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{t('projects.detail.progress')}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: project.color }}
              />
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-white font-semibold mb-4">{t('projects.detail.taskBoard')}</h3>
      <KanbanBoard
        tasks={tasks}
        onStatusChange={updateTaskStatus}
        onAddTask={addTask}
        defaultProjectId={id}
        defaultProjectName={project.name}
        defaultProjectColor={project.color}
      />
    </div>
  );
}
