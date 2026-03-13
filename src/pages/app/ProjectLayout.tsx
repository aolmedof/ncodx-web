import { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/app/ProjectSidebar';
import { GlobalTopbar } from '@/components/app/GlobalTopbar';
import { mockProjects } from '@/lib/mock-data';

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const [collapsed, setCollapsed] = useState(false);
  const project = mockProjects.find((p) => p.id === projectId) ?? mockProjects[0];

  return (
    <div className="flex flex-col min-h-screen bg-signal-bg font-mono text-signal-text">
      <GlobalTopbar />
      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar
          project={project}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <main className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
