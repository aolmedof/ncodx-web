import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CommandPalette } from '@/components/app/CommandPalette';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const Home = lazy(() => import('@/pages/public/Home').then(module => ({ default: module.Home })));
const SignIn = lazy(() => import('@/pages/public/SignIn').then(module => ({ default: module.SignIn })));
const AppLayout = lazy(() => import('@/pages/app/AppLayout').then(module => ({ default: module.AppLayout })));
const ProjectLayout = lazy(() => import('@/pages/app/ProjectLayout').then(module => ({ default: module.ProjectLayout })));
const ProjectSelector = lazy(() => import('@/pages/app/ProjectSelector'));
const ProjectDashboard = lazy(() => import('@/pages/app/ProjectDashboard'));
const Boards = lazy(() => import('@/pages/app/Boards'));
const Repos = lazy(() => import('@/pages/app/Repos'));
const Pipelines = lazy(() => import('@/pages/app/Pipelines'));
const CalendarPage = lazy(() => import('@/pages/app/CalendarPage').then(module => ({ default: module.CalendarPage })));
const Notes = lazy(() => import('@/pages/app/Notes').then(module => ({ default: module.Notes })));
const AiChat = lazy(() => import('@/pages/app/AiChat').then(module => ({ default: module.AiChat })));
const Secrets = lazy(() => import('@/pages/app/Secrets').then(module => ({ default: module.Secrets })));
const TerminalPage = lazy(() => import('@/pages/app/TerminalPage'));
const ProjectSettings = lazy(() => import('@/pages/app/ProjectSettings'));
const Timesheets = lazy(() => import('@/pages/app/Timesheets').then(module => ({ default: module.Timesheets })));
const Invoices = lazy(() => import('@/pages/app/Invoices').then(module => ({ default: module.Invoices })));
const Contracts = lazy(() => import('@/pages/app/Contracts').then(module => ({ default: module.Contracts })));
const Profile = lazy(() => import('@/pages/app/Profile').then(module => ({ default: module.Profile })));
const UserSettings = lazy(() => import('@/pages/app/UserSettings').then(module => ({ default: module.UserSettings })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // These lists are small and cheap; a short stale window keeps navigation
      // instant without serving obviously cold data.
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // api.ts already redirects on 401, so retrying an auth failure just delays it.
      retry: (failureCount, error) =>
        failureCount < 2 && !(error instanceof Error && error.message === 'Unauthorized'),
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner size="lg" className="min-h-screen bg-canvas" />}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Global (non-project) routes */}
            <Route index element={<ProjectSelector />} />
            <Route path="timesheets" element={<Timesheets />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<UserSettings />} />

            {/* Project-specific routes with project sidebar */}
            <Route path="p/:projectId" element={<ProjectLayout />}>
              <Route index element={<ProjectDashboard />} />
              <Route path="boards" element={<Boards />} />
              <Route path="repos" element={<Repos />} />
              <Route path="pipelines" element={<Pipelines />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="notes" element={<Notes />} />
              <Route path="ai" element={<AiChat />} />
              <Route path="secrets" element={<Secrets />} />
              <Route path="terminal" element={<TerminalPage />} />
              <Route path="settings" element={<ProjectSettings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <CommandPalette />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
