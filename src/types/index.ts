// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  timezone: string;
  language: 'es' | 'en';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Projects ────────────────────────────────────────────────────────────────
export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: ProjectStatus;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  members: string[];
  tags: string[];
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  projectName: string;
  projectColor: string;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// ─── Calendar ────────────────────────────────────────────────────────────────
export type CalendarSource = 'internal' | 'google' | 'outlook';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  source: CalendarSource;
  color: string;
  allDay?: boolean;
}

// ─── Notes (Post-its) ────────────────────────────────────────────────────────
export type NoteColor = 'yellow' | 'pink' | 'green' | 'blue' | 'orange';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  posX: number;
  posY: number;
  createdAt: string;
  updatedAt: string;
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ─── Secrets ─────────────────────────────────────────────────────────────────
export type SecretCategory = 'api_key' | 'password' | 'token' | 'other';

export interface Secret {
  id: string;
  name: string;
  value: string;
  category: SecretCategory;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export interface DashboardStats {
  totalTasks: number;
  completedToday: number;
  pending: number;
  activeProjects: number;
}
