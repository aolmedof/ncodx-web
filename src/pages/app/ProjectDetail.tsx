import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { mockProjects } from '@/lib/mock-data';
import { useTasks } from '@/hooks/useTasks';
import { KanbanBoard } from '@/components/app/KanbanBoard';

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();
  const project = mockProjects.find((p) => p.id === projectId);
  const { tasks, updateTaskStatus, addTask } = useTasks(projectId);

  if (!project) {
    return (
      <div className="p-6 font-mono">
        <p className="text-signal-text-muted text-sm">
          Project not found.{' '}
          <Link to="/app/projects" className="text-signal-green hover:underline">
            {t('projects.detail.backToProjects')}
          </Link>
        </p>
      </div>
    );
  }

  const progress = project.taskCount > 0 ? (project.completedTaskCount / project.taskCount) * 100 : 0;

  return (
    <div className="p-6 bg-signal-bg min-h-full font-mono">
      {/* Back navigation */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/app/projects"
          className="text-signal-text-muted hover:text-signal-text text-xs flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={13} /> {t('projects.detail.backToProjects')}
        </Link>
      </div>

      {/* Project header */}
      <div className="mb-6">
        <div className="text-signal-text-muted text-xs tracking-widest mb-2">// PROJECT</div>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: project.color }}
          />
          <h2 className="text-xl font-bold text-signal-text">{project.name}</h2>
        </div>
        <p className="text-signal-text-muted text-sm mb-4">{project.description}</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs text-signal-text-muted mb-1">
              <span>{t('projects.detail.progress')}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-signal-surface border border-signal-border rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: project.color }}
              />
            </div>
          </div>
          <span className="text-xs text-signal-text-muted">
            {project.completedTaskCount}/{project.taskCount} tasks
          </span>
        </div>
      </div>

      <div className="text-signal-text-muted text-xs tracking-widest mb-4">// TASK BOARD</div>
      <KanbanBoard
        tasks={tasks}
        onStatusChange={updateTaskStatus}
        onAddTask={addTask}
        defaultProjectId={projectId}
        defaultProjectName={project.name}
        defaultProjectColor={project.color}
      />
    </div>
  );
}
