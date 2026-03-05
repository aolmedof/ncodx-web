import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '@/components/app/Sidebar';
import { Topbar } from '@/components/app/Topbar';

const TITLES: Record<string, string> = {
  '/app': 'app.dashboard',
  '/app/projects': 'app.projects',
  '/app/calendar': 'app.calendar',
  '/app/tasks': 'app.tasks',
  '/app/notes': 'app.notes',
  '/app/ai': 'app.ai',
  '/app/secrets': 'app.secrets',
  '/app/settings': 'app.settings',
};

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  const titleKey = Object.keys(TITLES).find(
    (key) => location.pathname === key || location.pathname.startsWith(key + '/')
  ) || '/app';

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={t(TITLES[titleKey] || 'app.dashboard')} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
