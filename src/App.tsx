import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from '@/pages/public/Home';
import { SignIn } from '@/pages/public/SignIn';
import { AppLayout } from '@/pages/app/AppLayout';
import { Dashboard } from '@/pages/app/Dashboard';
import { Projects } from '@/pages/app/Projects';
import { ProjectDetail } from '@/pages/app/ProjectDetail';
import { CalendarPage } from '@/pages/app/CalendarPage';
import { Tasks } from '@/pages/app/Tasks';
import { Notes } from '@/pages/app/Notes';
import { AiChat } from '@/pages/app/AiChat';
import { Secrets } from '@/pages/app/Secrets';
import { Settings } from '@/pages/app/Settings';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="notes" element={<Notes />} />
            <Route path="ai" element={<AiChat />} />
            <Route path="secrets" element={<Secrets />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
