import { useState } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { ProjectSidebar } from '@/components/app/ProjectSidebar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/ui';
import { useProject } from '@/hooks/queries';

/**
 * Renders inside AppLayout, which already owns the topbar and the scroll
 * container — so this adds the sidebar only. The sidebar sticks while the
 * page content scrolls beneath the topbar.
 */
export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const [collapsed, setCollapsed] = useState(false);
  const { data: project, isPending, isError, error, refetch } = useProject(projectId);

  if (!projectId) return <Navigate to="/app" replace />;

  return (
    <div className="flex min-h-full items-start">
      <ProjectSidebar
        project={project}
        loading={isPending}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div className="min-w-0 flex-1">
        {isPending ? (
          <LoadingSpinner size="lg" className="py-24" />
        ) : isError ? (
          <ErrorState
            title="Could not load this project"
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
            className="py-24"
          />
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
