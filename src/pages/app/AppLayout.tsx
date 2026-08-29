import { Outlet } from 'react-router-dom';
import { GlobalTopbar } from '@/components/app/GlobalTopbar';

/** Owns the only GlobalTopbar in the tree and the single scroll container. */
export function AppLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas text-ink">
      <GlobalTopbar />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
