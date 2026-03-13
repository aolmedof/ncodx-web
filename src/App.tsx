import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from '@/pages/public/Home';
import { SignIn } from '@/pages/public/SignIn';
import { AppLayout } from '@/pages/app/AppLayout';
import { ProjectLayout } from '@/pages/app/ProjectLayout';
import ProjectSelector from '@/pages/app/ProjectSelector';
import ProjectDashboard from '@/pages/app/ProjectDashboard';
import Boards from '@/pages/app/Boards';
import Repos from '@/pages/app/Repos';
import Pipelines from '@/pages/app/Pipelines';
import { CalendarPage } from '@/pages/app/CalendarPage';
import { Notes } from '@/pages/app/Notes';
import { AiChat } from '@/pages/app/AiChat';
import { Secrets } from '@/pages/app/Secrets';
import TerminalPage from '@/pages/app/TerminalPage';
import ProjectSettings from '@/pages/app/ProjectSettings';
import { Timesheets } from '@/pages/app/Timesheets';
import { Invoices } from '@/pages/app/Invoices';
import { Contracts } from '@/pages/app/Contracts';
import { Profile } from '@/pages/app/Profile';
import { UserSettings } from '@/pages/app/UserSettings';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CommandPalette } from '@/components/app/CommandPalette';

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
        <CommandPalette />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
