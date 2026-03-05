import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle,
  Clock,
  FolderKanban,
  ArrowRight,
  Plus,
  Calendar,
  Zap,
} from 'lucide-react';
import { mockDashboardStats, mockTasks, mockCalendarEvents } from '@/lib/mock-data';
import { getUser } from '@/lib/auth';
import { format } from 'date-fns';

const PRIORITY_COLORS = {
  low: 'bg-slate-600 text-slate-200',
  medium: 'bg-amber-600/20 text-amber-300 border border-amber-700/40',
  high: 'bg-orange-600/20 text-orange-300 border border-orange-700/40',
  urgent: 'bg-red-600/20 text-red-300 border border-red-700/40',
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function Dashboard() {
  const { t } = useTranslation();
  const user = getUser();
  const stats = mockDashboardStats;
  const recentTasks = mockTasks.slice(0, 5);
  const upcomingEvents = mockCalendarEvents.slice(0, 4);

  const statCards = [
    { key: 'totalTasks', value: stats.totalTasks, icon: CheckSquare, color: 'text-primary-400', bg: 'bg-primary-900/30' },
    { key: 'completedToday', value: stats.completedToday, icon: CheckCircle, color: 'text-accent-400', bg: 'bg-accent-900/30' },
    { key: 'pending', value: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-900/30' },
    { key: 'activeProjects', value: stats.activeProjects, icon: FolderKanban, color: 'text-violet-400', bg: 'bg-violet-900/30' },
  ];

  return (
    <div className="p-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-white">
          {t('app.welcome')}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {statCards.map(({ key, value, icon: Icon, color, bg }) => (
          <motion.div
            key={key}
            variants={item}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">{t(`dashboard.${key}`)}</span>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={16} className={color} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{value}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{t('dashboard.recentTasks')}</h3>
            <Link
              to="/app/tasks"
              className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm transition-colors"
            >
              {t('dashboard.viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.projectColor }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-medium truncate">{task.title}</p>
                  <p className="text-slate-500 text-xs">{task.projectName}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${PRIORITY_COLORS[task.priority]}`}>
                  {t(`tasks.priority.${task.priority}`)}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md ${
                    task.status === 'done'
                      ? 'bg-accent-900/40 text-accent-300'
                      : task.status === 'in_progress'
                      ? 'bg-primary-900/40 text-primary-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {t(`tasks.columns.${task.status}`)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events + Quick Actions */}
        <div className="space-y-4">
          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <h3 className="text-white font-semibold mb-3">{t('dashboard.quickActions')}</h3>
            <div className="space-y-2">
              <Link
                to="/app/tasks"
                className="flex items-center gap-2 w-full px-3 py-2.5 bg-primary-600/20 hover:bg-primary-600/30 border border-primary-700/30 rounded-lg text-primary-300 text-sm font-medium transition-colors"
              >
                <Plus size={15} /> {t('app.newTask')}
              </Link>
              <Link
                to="/app/projects"
                className="flex items-center gap-2 w-full px-3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-colors"
              >
                <FolderKanban size={15} /> {t('app.newProject')}
              </Link>
              <Link
                to="/app/ai"
                className="flex items-center gap-2 w-full px-3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-colors"
              >
                <Zap size={15} /> {t('app.ai')}
              </Link>
            </div>
          </motion.div>

          {/* Upcoming events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{t('dashboard.upcomingEvents')}</h3>
              <Link to="/app/calendar">
                <Calendar size={15} className="text-slate-400 hover:text-white transition-colors" />
              </Link>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-slate-200 text-sm truncate">{event.title}</p>
                    <p className="text-slate-500 text-xs">
                      {format(event.start, 'MMM d, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
