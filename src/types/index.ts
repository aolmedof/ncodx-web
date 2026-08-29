/* ---------------------------------------------------------------------------
 * Wire types.
 *
 * These mirror exactly what the API returns — camelCase throughout. Anything the
 * UI needs but the API does not send (a project's name on a task, a colour on a
 * timesheet row) is joined client-side from the projects list rather than being
 * declared here, so this file stays an honest description of the wire format.
 * ------------------------------------------------------------------------- */

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
  userId: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  status: ProjectStatus;
  clientName: string | null;
  clientEmail: string | null;
  hourlyRate: number | null;
  monthlyRate: number | null;
  currency: string | null;
  startDate: string | null;
  endDate: string | null;
  azureDevopsOrg: string | null;
  azureDevopsProject: string | null;
  githubRepo: string | null;
  awsAccountId: string | null;
  awsRegion: string | null;
  jumpserverUsername: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectInput = Partial<Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

// ─── Tasks ───────────────────────────────────────────────────────────────────
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  userId: string;
  projectId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskInput = Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

// ─── Calendar ────────────────────────────────────────────────────────────────
export type CalendarSource = 'internal' | 'google' | 'outlook';

export interface CalendarEvent {
  id: string;
  userId: string;
  connectionId: string | null;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location: string | null;
  source: CalendarSource;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarConnection {
  id: string;
  provider: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── Notes ───────────────────────────────────────────────────────────────────
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  /** Hex string chosen by the user, not a fixed enum. */
  color: string;
  pinned: boolean;
  posX: number;
  posY: number;
  createdAt: string;
  updatedAt: string;
}

// ─── AI chat ─────────────────────────────────────────────────────────────────
export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  title: string;
  messages: AiMessage[];
  createdAt: string;
  updatedAt: string;
}

// ─── Secrets ─────────────────────────────────────────────────────────────────
/** The list endpoint deliberately omits `value`; only the detail route returns it. */
export interface Secret {
  id: string;
  name: string;
  category: string;
  value?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Goals ───────────────────────────────────────────────────────────────────
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  progress: number;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Contracts ───────────────────────────────────────────────────────────────
export type ContractType = 'hourly' | 'monthly' | 'fixed' | 'retainer';
export type ContractStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface Contract {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  type: ContractType;
  rate: number;
  currency: string;
  startDate: string;
  endDate: string | null;
  status: ContractStatus;
  documentUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Timesheets ──────────────────────────────────────────────────────────────
export interface TimesheetEntry {
  id: string;
  userId: string;
  projectId: string;
  contractId: string | null;
  date: string;
  hours: number;
  description: string | null;
  billable: boolean;
  approved: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetSummary {
  totalHours: number;
  billableHours: number;
  totalEntries: number;
  byProject: Array<{ projectId: string; hours: number; entries: number }>;
}

// ─── Invoices ────────────────────────────────────────────────────────────────
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  userId: string;
  projectId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  notes: string | null;
  pdfUrl: string | null;
  /** Present on the detail route; absent from the list. */
  items?: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── Integrations ────────────────────────────────────────────────────────────
export interface Integration {
  id: string;
  projectId: string;
  provider: string;
  tokenExpiry: string | null;
  scopes: string | null;
  metadataJson: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardOverview {
  projects: { total: number; active: number };
  tasks: { total: number; byStatus: Partial<Record<TaskStatus, number>> };
  time: { hoursThisMonth: number; totalBillableHours: number; totalEntries: number };
  invoices: { draft: number; sent: number; paid: number; totalPending: number; totalPaid: number };
  contracts: { total: number; active: number };
  goals: { total: number; avgProgress: number };
  upcomingEvents: CalendarEvent[];
}

// ─── Repos & pipelines (proxy routes) ────────────────────────────────────────
export interface RepoBranch {
  name: string;
  sha?: string;
  isDefault?: boolean;
  protected?: boolean;
  lastCommit?: string;
  updatedAt?: string;
  author?: string;
}

export interface RepoCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  branch?: string;
}

export interface RepoPR {
  id: number;
  title: string;
  author: string;
  status: 'open' | 'merged' | 'closed';
  branch?: string;
  targetBranch?: string;
  createdAt: string;
  reviewers?: string[];
}

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
