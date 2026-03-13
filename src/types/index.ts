// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  timezone: string;
  language: 'es' | 'en';
  phone?: string;
  company?: string;
  tax_id?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  bank_name?: string;
  bank_account?: string;
  bank_routing?: string;
  payment_method?: string;
  paypal_email?: string;
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
  icon?: string;
  status: ProjectStatus;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  members: string[];
  tags: string[];
  client_name?: string;
  client_email?: string;
  hourly_rate?: number;
  monthly_rate?: number;
  currency?: string;
  github_repo?: string;
  azure_devops_org?: string;
  azure_devops_project?: string;
  aws_account_id?: string;
  aws_region?: string;
  jumpserver_username?: string;
  hoursThisWeek?: number;
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
  projectId?: string;
}

export interface CalendarConnection {
  id: string;
  provider: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
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
  projectId?: string;
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
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AiMessage = ChatMessage;
export type AiConversation = ChatConversation;

// ─── Secrets ─────────────────────────────────────────────────────────────────
export type SecretCategory = 'api_key' | 'password' | 'token' | 'other';

export interface Secret {
  id: string;
  name: string;
  value: string;
  category: SecretCategory;
  description?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Goals ───────────────────────────────────────────────────────────────────
export interface Goal {
  id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  dueDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Shopping ────────────────────────────────────────────────────────────────
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  checked: boolean;
  category?: string;
  userId: string;
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

// ─── Contracts ───────────────────────────────────────────────────────────────
export type ContractType = 'hourly' | 'monthly' | 'fixed' | 'retainer';
export type ContractStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface Contract {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  type: ContractType;
  rate: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: ContractStatus;
  document_url?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Timesheets ───────────────────────────────────────────────────────────────
export interface TimesheetEntry {
  id: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  contractId?: string;
  date: string;
  hours: number;
  description?: string;
  billable: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  projectName: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  notes?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Repos ────────────────────────────────────────────────────────────────────
export interface RepoBranch {
  name: string;
  sha: string;
  isDefault?: boolean;
  protected?: boolean;
  lastCommit?: string;
  updatedAt?: string;
  author: string;
}

export interface RepoCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  branch: string;
}

export interface RepoPR {
  id: number;
  title: string;
  author: string;
  status: 'open' | 'merged' | 'closed';
  branch: string;
  targetBranch: string;
  createdAt: string;
  reviewers: string[];
}

// ─── Pipelines ────────────────────────────────────────────────────────────────
export type PipelineStatus = 'success' | 'failed' | 'running' | 'pending' | 'queued' | 'cancelled';
export type PipelineProvider = 'azure' | 'aws' | 'github';

export interface Pipeline {
  id: string;
  name: string;
  provider: PipelineProvider;
  branch: string;
  status: PipelineStatus;
  duration?: number | string;
  startedAt?: string;
  timestamp?: string;
  triggeredBy?: string;
  buildNumber?: number;
  commitSha?: string;
  commit?: string;
  commitMessage?: string;
}
