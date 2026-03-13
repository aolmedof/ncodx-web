import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle,
  Clock,
  FolderKanban,
  ArrowRight,
} from 'lucide-react';
import { mockDashboardStats, mockTasks, mockProjects, mockTimesheetEntries } from '@/lib/mock-data';
import { format } from 'date-fns';

const PRIORITY_COLORS = {
  low: 'bg-signal-surface text-signal-text-dim border border-signal-border',
  medium: 'bg-signal-surface text-amber-400 border border-amber-700/40',
  high: 'bg-signal-surface text-orange-400 border border-orange-700/40',
  urgent: 'bg-signal-surface text-red-400 border border-red-700/40',
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Dashboard() {
  const { t } = useTranslation();
  const stats = mockDashboardStats;
  const recentTasks = mockTasks.slice(0, 5);
  const activeProjects = mockProjects.filter((p) => p.status === 'active');
  const totalHoursThisWeek = mockTimesheetEntries.reduce((sum, e) => sum + e.hours, 0);

  const statCards = [
    {
      label: t('dashboard.totalTasks', 'Total Tasks'),
      value: stats.totalTasks,
      icon: CheckSquare,
      iconClass: 'text-signal-green',
    },
    {
      label: t('dashboard.completedToday', 'Completed Today'),
      value: stats.completedToday,
      icon: CheckCircle,
      iconClass: 'text-signal-green',
    },
    {
      label: t('dashboard.hoursThisWeek', 'Hours This Week'),
      value: totalHoursThisWeek,
      icon: Clock,
      iconClass: 'text-signal-text-dim',
    },
    {
      label: t('dashboard.activeProjects', 'Active Projects'),
      value: stats.activeProjects,
      icon: FolderKanban,
      iconClass: 'text-signal-text-dim',
    },
  ];

  return (
    <div className="p-6 bg-signal-bg min-h-full font-mono">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="text-signal-text-muted text-xs tracking-widest mb-1">// GLOBAL OVERVIEW</div>
        <h2 className="text-xl font-bold text-signal-text">
          {t('dashboard.title', 'Dashboard')}
        </h2>
        <p className="text-signal-text-muted text-xs mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
      >
        {statCards.map(({ label, value, icon: Icon, iconClass }) => (
          <motion.div
            key={label}
            variants={item}
            className="bg-signal-card border border-signal-border rounded p-4 hover:border-signal-border-bright transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-signal-text-muted text-xs uppercase tracking-wider">{label}</span>
              <Icon size={15} className={iconClass} />
            </div>
            <div className="text-3xl font-bold text-signal-text">{value}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-signal-card border border-signal-border rounded p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-signal-text-muted tracking-widest">// RECENT TASKS</div>
            <Link
              to="/app/tasks"
              className="flex items-center gap-1 text-signal-green hover:text-signal-text text-xs transition-colors"
            >
              {t('dashboard.viewAll', 'View all')} <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-1">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2.5 rounded hover:bg-signal-surface transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.projectColor }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-signal-text text-sm truncate">{task.title}</p>
                  <p className="text-signal-text-muted text-xs">{task.projectName}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${PRIORITY_COLORS[task.priority]}`}>
                  {t(`tasks.priority.${task.priority}`, task.priority)}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    task.status === 'done'
                      ? 'text-signal-green border border-signal-green/40'
                      : task.status === 'in_progress'
                      ? 'text-signal-text-dim border border-signal-border-bright'
                      : 'text-signal-text-muted border border-signal-border'
                  }`}
                >
                  {t(`tasks.columns.${task.status}`, task.status)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links to Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-signal-card border border-signal-border rounded p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-signal-text-muted tracking-widest">// PROJECTS</div>
            <Link
              to="/app/projects"
              className="flex items-center gap-1 text-signal-green hover:text-signal-text text-xs transition-colors"
            >
              {t('dashboard.viewAll', 'View all')} <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {activeProjects.map((project) => {
              const progress =
                project.taskCount > 0
                  ? Math.round((project.completedTaskCount / project.taskCount) * 100)
                  : 0;
              return (
                <Link
                  key={project.id}
                  to={`/app/p/${project.id}`}
                  className="block p-3 bg-signal-surface border border-signal-border hover:border-signal-border-bright rounded transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-signal-text text-xs font-semibold truncate group-hover:text-signal-green transition-colors">
                      {project.name}
                    </span>
                  </div>
                  <div className="w-full bg-signal-bg rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: project.color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-signal-text-muted mt-1">
                    <span>{project.completedTaskCount}/{project.taskCount} tasks</span>
                    <span>{progress}%</span>
                  </div>
                </Link>
              );
            })}
            {activeProjects.length === 0 && (
              <p className="text-signal-text-muted text-xs py-4 text-center">
                {t('projects.noProjects', 'No active projects')}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
