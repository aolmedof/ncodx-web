import { Outlet } from 'react-router-dom';
import { GlobalTopbar } from '@/components/app/GlobalTopbar';

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-signal-bg font-mono text-signal-text">
      <GlobalTopbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
