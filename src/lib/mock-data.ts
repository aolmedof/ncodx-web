import type {
  Project, Task, CalendarEvent, Note, ChatConversation,
  Secret, DashboardStats, Contract, TimesheetEntry, Invoice,
  InvoiceItem, RepoBranch, RepoCommit, RepoPR, Pipeline,
} from '@/types';

// ─── Projects ────────────────────────────────────────────────────────────────
export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Cloud Migration',
    description: 'Migrating legacy infrastructure to AWS with zero downtime',
    color: '#2563eb',
    status: 'active',
    taskCount: 12,
    completedTaskCount: 7,
    createdAt: '2025-11-01T09:00:00Z',
    updatedAt: '2026-02-28T14:22:00Z',
    dueDate: '2026-04-30',
    members: ['arturo.olmedof@hotmail.com'],
    tags: ['aws', 'infrastructure', 'devops'],
    client_name: 'TechCorp SA',
    client_email: 'contact@techcorp.com',
    hourly_rate: 85,
    currency: 'USD',
    github_repo: 'aolmedof/cloud-migration',
    azure_devops_org: 'ncodx',
    azure_devops_project: 'CloudMigration',
    aws_account_id: '123456789012',
    aws_region: 'us-east-1',
    jumpserver_username: 'arturo',
    hoursThisWeek: 18,
  },
  {
    id: 'p2',
    name: 'NCODX Platform',
    description: 'Internal project management and collaboration platform',
    color: '#0d9488',
    status: 'active',
    taskCount: 28,
    completedTaskCount: 15,
    createdAt: '2025-10-15T10:00:00Z',
    updatedAt: '2026-03-04T11:00:00Z',
    dueDate: '2026-06-01',
    members: ['arturo.olmedof@hotmail.com', 'g.olmedof@gmail.com'],
    tags: ['react', 'typescript', 'platform'],
    client_name: 'NCODX Internal',
    hourly_rate: 0,
    currency: 'USD',
    github_repo: 'aolmedof/ncodx-web',
    hoursThisWeek: 32,
  },
  {
    id: 'p3',
    name: 'Client Portal v2',
    description: 'Redesign and modernize the client-facing portal',
    color: '#7c3aed',
    status: 'active',
    taskCount: 18,
    completedTaskCount: 4,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-03-01T16:00:00Z',
    dueDate: '2026-05-15',
    members: ['arturo.olmedof@hotmail.com', 'anastasia888a@gmail.com'],
    tags: ['ux', 'portal', 'client'],
    client_name: 'Retail Group MX',
    client_email: 'it@retailgroup.mx',
    hourly_rate: 95,
    currency: 'USD',
    azure_devops_org: 'retailgroup',
    azure_devops_project: 'ClientPortal',
    hoursThisWeek: 12,
  },
];

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const mockTasks: Task[] = [
  {
    id: 't1', title: 'Set up VPC and subnets in us-east-1',
    description: 'Create private/public subnets, route tables, NAT gateway',
    status: 'done', priority: 'high', projectId: 'p1',
    projectName: 'Cloud Migration', projectColor: '#2563eb',
    dueDate: '2026-02-15', createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-02-14T16:00:00Z',
    tags: ['aws', 'networking'],
  },
  {
    id: 't2', title: 'Configure RDS PostgreSQL cluster',
    description: 'Set up multi-AZ RDS with read replicas and automated backups',
    status: 'in_progress', priority: 'high', projectId: 'p1',
    projectName: 'Cloud Migration', projectColor: '#2563eb',
    dueDate: '2026-03-15', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-03-01T14:00:00Z',
    tags: ['aws', 'database'],
  },
  {
    id: 't3', title: 'Implement Kanban board drag & drop',
    description: 'Use @dnd-kit to create fully interactive kanban columns',
    status: 'in_progress', priority: 'medium', projectId: 'p2',
    projectName: 'NCODX Platform', projectColor: '#0d9488',
    dueDate: '2026-03-10', createdAt: '2026-02-20T11:00:00Z', updatedAt: '2026-03-04T09:00:00Z',
    tags: ['react', 'ui'],
  },
  {
    id: 't4', title: 'Design new dashboard UI mockups',
    description: 'Create Figma mockups for the updated dashboard layout',
    status: 'review', priority: 'medium', projectId: 'p3',
    projectName: 'Client Portal v2', projectColor: '#7c3aed',
    dueDate: '2026-03-08', createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-03-03T15:00:00Z',
    tags: ['design', 'ux'],
  },
  {
    id: 't5', title: 'Write API documentation',
    description: 'Document all REST endpoints with OpenAPI 3.0 spec',
    status: 'todo', priority: 'low', projectId: 'p2',
    projectName: 'NCODX Platform', projectColor: '#0d9488',
    dueDate: '2026-03-20', createdAt: '2026-02-25T08:00:00Z', updatedAt: '2026-02-25T08:00:00Z',
    tags: ['documentation', 'api'],
  },
  {
    id: 't6', title: 'Set up CI/CD pipeline with GitHub Actions',
    description: 'Build, test, deploy workflow for all environments',
    status: 'todo', priority: 'high', projectId: 'p1',
    projectName: 'Cloud Migration', projectColor: '#2563eb',
    dueDate: '2026-03-25', createdAt: '2026-02-28T09:00:00Z', updatedAt: '2026-02-28T09:00:00Z',
    tags: ['cicd', 'devops'],
  },
  {
    id: 't7', title: 'Implement OAuth2 for client portal',
    description: 'Add Google and Microsoft SSO to the client login flow',
    status: 'review', priority: 'high', projectId: 'p3',
    projectName: 'Client Portal v2', projectColor: '#7c3aed',
    dueDate: '2026-03-12', createdAt: '2026-02-10T11:00:00Z', updatedAt: '2026-03-02T17:00:00Z',
    tags: ['auth', 'oauth'],
  },
  {
    id: 't8', title: 'Add dark mode toggle',
    description: 'Implement theme switching across all components',
    status: 'done', priority: 'medium', projectId: 'p2',
    projectName: 'NCODX Platform', projectColor: '#0d9488',
    dueDate: '2026-03-05', createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-03-05T15:00:00Z',
    tags: ['ui', 'theme'],
  },
  {
    id: 't9', title: 'Configure CloudFront distribution',
    description: 'Set up CDN with custom domain and SSL',
    status: 'todo', priority: 'medium', projectId: 'p1',
    projectName: 'Cloud Migration', projectColor: '#2563eb',
    dueDate: '2026-04-01', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
    tags: ['aws', 'cdn'],
  },
  {
    id: 't10', title: 'User acceptance testing',
    description: 'Run UAT with 5 client users across all features',
    status: 'todo', priority: 'urgent', projectId: 'p3',
    projectName: 'Client Portal v2', projectColor: '#7c3aed',
    dueDate: '2026-04-10', createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-03-01T09:00:00Z',
    tags: ['testing', 'uat'],
  },
  {
    id: 't11', title: 'Set up monitoring with Datadog',
    description: 'APM, infrastructure monitoring, and alerting',
    status: 'in_progress', priority: 'high', projectId: 'p1',
    projectName: 'Cloud Migration', projectColor: '#2563eb',
    dueDate: '2026-03-20', createdAt: '2026-02-20T09:00:00Z', updatedAt: '2026-03-08T11:00:00Z',
    tags: ['monitoring', 'observability'],
  },
  {
    id: 't12', title: 'Implement AI assistant module',
    description: 'Integrate Claude API for project context assistant',
    status: 'todo', priority: 'medium', projectId: 'p2',
    projectName: 'NCODX Platform', projectColor: '#0d9488',
    dueDate: '2026-04-15', createdAt: '2026-03-05T10:00:00Z', updatedAt: '2026-03-05T10:00:00Z',
    tags: ['ai', 'api'],
  },
];

// ─── Calendar Events ──────────────────────────────────────────────────────────
const today = new Date();
const y = today.getFullYear();
const m = today.getMonth();
const d = today.getDate();

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'e1', title: 'Sprint Planning',
    start: new Date(y, m, d + 1, 10, 0), end: new Date(y, m, d + 1, 11, 30),
    description: 'Q1 sprint planning session', source: 'internal', color: '#2563eb', projectId: 'p2',
  },
  {
    id: 'e2', title: 'Client Review — Cloud Migration',
    start: new Date(y, m, d + 2, 15, 0), end: new Date(y, m, d + 2, 16, 0),
    description: 'Demo progress to client team', source: 'google', color: '#dc2626', projectId: 'p1',
  },
  {
    id: 'e3', title: 'Team Standup',
    start: new Date(y, m, d, 9, 30), end: new Date(y, m, d, 9, 45),
    description: 'Daily sync', source: 'internal', color: '#0d9488',
  },
  {
    id: 'e4', title: 'Design Review',
    start: new Date(y, m, d + 4, 14, 0), end: new Date(y, m, d + 4, 15, 0),
    description: 'Review Client Portal v2 mockups', source: 'outlook', color: '#7c3aed', projectId: 'p3',
  },
  {
    id: 'e5', title: 'Product Roadmap Review',
    start: new Date(y, m, d + 7, 11, 0), end: new Date(y, m, d + 7, 12, 30),
    description: 'Q2 roadmap alignment', source: 'google', color: '#d97706',
  },
  {
    id: 'e6', title: 'Deploy to Production',
    start: new Date(y, m, d + 3, 20, 0), end: new Date(y, m, d + 3, 22, 0),
    description: 'Cloud Migration phase 1', source: 'internal', color: '#059669', projectId: 'p1',
  },
  {
    id: 'e7', title: 'Invoice Due — TechCorp',
    start: new Date(y, m, d + 5, 9, 0), end: new Date(y, m, d + 5, 9, 30),
    description: 'INV-2026-001 payment due', source: 'internal', color: '#dc2626',
  },
  {
    id: 'e8', title: 'Architecture Workshop',
    start: new Date(y, m, d + 10, 10, 0), end: new Date(y, m, d + 10, 16, 0),
    description: 'EKS architecture planning session', source: 'internal', color: '#2563eb', projectId: 'p1',
  },
];

// ─── Notes ───────────────────────────────────────────────────────────────────
export const mockNotes: Note[] = [
  {
    id: 'n1', title: 'Architecture Decision', projectId: 'p1',
    content: 'Use OAC instead of OAI for new CloudFront distributions. OAI is legacy.',
    color: 'yellow', pinned: true, posX: 80, posY: 80,
    createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'n2', title: 'Client Meeting Notes', projectId: 'p1',
    content: 'TechCorp wants Kubernetes by Q2. Budget approved. Escalate to team.',
    color: 'pink', pinned: false, posX: 320, posY: 80,
    createdAt: '2026-02-15T14:00:00Z', updatedAt: '2026-02-15T14:00:00Z',
  },
  {
    id: 'n3', title: 'API Keys to rotate', projectId: 'p2',
    content: '- OpenAI key (expires Mar 15)\n- Stripe webhook key\n- AWS access key prod',
    color: 'green', pinned: true, posX: 560, posY: 80,
    createdAt: '2026-02-20T09:00:00Z', updatedAt: '2026-03-01T11:00:00Z',
  },
  {
    id: 'n4', title: 'Tech Debt', projectId: 'p2',
    content: 'Migrate from CRA to Vite. Update React Query v4→v5. Remove lodash deps.',
    color: 'blue', pinned: false, posX: 80, posY: 300,
    createdAt: '2026-02-25T15:00:00Z', updatedAt: '2026-02-25T15:00:00Z',
  },
  {
    id: 'n5', title: 'Ideas', projectId: 'p2',
    content: 'Add AI-powered PR reviews. Auto-generate release notes. Voice commands?',
    color: 'orange', pinned: false, posX: 320, posY: 300,
    createdAt: '2026-03-01T12:00:00Z', updatedAt: '2026-03-01T12:00:00Z',
  },
  {
    id: 'n6', title: 'Portal Design Requirements', projectId: 'p3',
    content: 'Client wants: dark mode, mobile-first, <2s load time, WCAG 2.1 AA.',
    color: 'yellow', pinned: true, posX: 80, posY: 520,
    createdAt: '2026-03-02T10:00:00Z', updatedAt: '2026-03-02T10:00:00Z',
  },
];

// ─── AI Conversations ─────────────────────────────────────────────────────────
export const mockConversations: ChatConversation[] = [
  {
    id: 'c1', title: 'Cloud Architecture Review', projectId: 'p1',
    createdAt: '2026-03-04T10:00:00Z', updatedAt: '2026-03-04T10:30:00Z',
    messages: [
      { id: 'm1', role: 'user', content: 'What are the best practices for a multi-region AWS architecture?', timestamp: '2026-03-04T10:00:00Z' },
      { id: 'm2', role: 'assistant', content: 'For a resilient multi-region AWS architecture:\n\n1. **Active-Active vs Active-Passive**: Choose based on your RTO/RPO\n2. **Global services**: Route53 with latency/failover routing, CloudFront CDN\n3. **Data replication**: DynamoDB Global Tables, RDS cross-region replicas\n4. **Stateless services**: Design workloads to be stateless for easy failover\n5. **IaC**: Terraform modules per region with shared state in S3+DynamoDB', timestamp: '2026-03-04T10:01:00Z' },
    ],
  },
  {
    id: 'c2', title: 'TypeScript generics help', projectId: 'p2',
    createdAt: '2026-03-03T15:00:00Z', updatedAt: '2026-03-03T15:20:00Z',
    messages: [
      { id: 'm3', role: 'user', content: 'How do I type a generic API response in TypeScript?', timestamp: '2026-03-03T15:00:00Z' },
      { id: 'm4', role: 'assistant', content: '```typescript\ninterface ApiResponse<T> {\n  data: T;\n  error: string | null;\n  status: number;\n}\n\nasync function fetchUser(id: string): Promise<ApiResponse<User>> {\n  const res = await fetch(`/api/users/${id}`);\n  return res.json();\n}\n```', timestamp: '2026-03-03T15:01:00Z' },
    ],
  },
];

// ─── Secrets ─────────────────────────────────────────────────────────────────
export const mockSecrets: Secret[] = [
  { id: 's1', name: 'OpenAI API Key', value: 'sk-proj-abc123def456ghi789', category: 'api_key', description: 'Production OpenAI key', projectId: 'p2', createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z' },
  { id: 's2', name: 'GitHub PAT — CI/CD', value: 'ghp_xxxxxxxxxxxxxxxxxxxx', category: 'token', description: 'GitHub Actions token', projectId: 'p1', createdAt: '2026-01-01T10:00:00Z', updatedAt: '2026-01-01T10:00:00Z' },
  { id: 's3', name: 'AWS Root Account Password', value: 'Sup3rS3cur3P@ss!', category: 'password', description: 'Emergency root only', projectId: 'p1', createdAt: '2025-06-01T10:00:00Z', updatedAt: '2026-01-01T10:00:00Z' },
  { id: 's4', name: 'Stripe Webhook Secret', value: 'whsec_abcdefghijklmnop', category: 'api_key', description: 'Webhook signature', projectId: 'p3', createdAt: '2026-02-10T10:00:00Z', updatedAt: '2026-02-10T10:00:00Z' },
  { id: 's5', name: 'PostgreSQL prod password', value: 'pg_prod_secr3t_2026!', category: 'password', description: 'RDS master password', projectId: 'p1', createdAt: '2025-11-01T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
  { id: 's6', name: 'Datadog API Key', value: 'dd_api_1a2b3c4d5e6f7g', category: 'api_key', description: 'Monitoring & observability', projectId: 'p1', createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
];

// ─── Contracts ───────────────────────────────────────────────────────────────
export const mockContracts: Contract[] = [
  { id: 'ct1', projectId: 'p1', projectName: 'Cloud Migration', title: 'Cloud Migration — Phase 1', type: 'hourly', rate: 85, currency: 'USD', startDate: '2025-11-01', endDate: '2026-04-30', status: 'active', notes: 'Full cloud migration including VPC, EKS, RDS', createdAt: '2025-10-25T10:00:00Z', updatedAt: '2025-10-25T10:00:00Z' },
  { id: 'ct2', projectId: 'p2', projectName: 'NCODX Platform', title: 'NCODX Internal Platform Dev', type: 'monthly', rate: 0, currency: 'USD', startDate: '2025-10-15', status: 'active', notes: 'Internal project, no billing', createdAt: '2025-10-10T10:00:00Z', updatedAt: '2025-10-10T10:00:00Z' },
  { id: 'ct3', projectId: 'p3', projectName: 'Client Portal v2', title: 'Client Portal Redesign', type: 'hourly', rate: 95, currency: 'USD', startDate: '2026-01-10', endDate: '2026-05-15', status: 'active', notes: 'Full redesign with new branding', createdAt: '2026-01-05T10:00:00Z', updatedAt: '2026-01-05T10:00:00Z' },
];

// ─── Timesheet Entries ────────────────────────────────────────────────────────
const projectColorMap: Record<string, string> = { p1: '#2563eb', p2: '#0d9488', p3: '#7c3aed' };
function tsEntry(id: string, pid: string, pname: string, date: string, hours: number, desc: string, billable = true): TimesheetEntry {
  return { id, projectId: pid, projectName: pname, projectColor: projectColorMap[pid] ?? '#2563eb', date, hours, description: desc, billable, approved: false, createdAt: date + 'T10:00:00Z', updatedAt: date + 'T10:00:00Z' };
}

const wk = (offset: number) => {
  const dt = new Date(); dt.setDate(dt.getDate() - dt.getDay() + offset);
  return dt.toISOString().split('T')[0];
};

export const mockTimesheetEntries: TimesheetEntry[] = [
  tsEntry('ts1', 'p1', 'Cloud Migration', wk(1), 4, 'VPC setup and subnet configuration'),
  tsEntry('ts2', 'p1', 'Cloud Migration', wk(1), 3, 'RDS cluster configuration'),
  tsEntry('ts3', 'p2', 'NCODX Platform', wk(1), 4, 'Kanban board implementation'),
  tsEntry('ts4', 'p3', 'Client Portal v2', wk(2), 3, 'UI mockups review'),
  tsEntry('ts5', 'p1', 'Cloud Migration', wk(2), 5, 'EC2 AMI migration and testing'),
  tsEntry('ts6', 'p2', 'NCODX Platform', wk(2), 4, 'Authentication module refactor'),
  tsEntry('ts7', 'p3', 'Client Portal v2', wk(3), 4, 'OAuth2 integration'),
  tsEntry('ts8', 'p1', 'Cloud Migration', wk(3), 6, 'Load balancer configuration'),
  tsEntry('ts9', 'p2', 'NCODX Platform', wk(3), 3, 'API endpoints documentation'),
  tsEntry('ts10', 'p3', 'Client Portal v2', wk(4), 5, 'Component library setup'),
  tsEntry('ts11', 'p1', 'Cloud Migration', wk(4), 4, 'Monitoring setup with Datadog'),
  tsEntry('ts12', 'p2', 'NCODX Platform', wk(4), 4, 'Dark theme implementation'),
  tsEntry('ts13', 'p1', 'Cloud Migration', wk(5), 3, 'Security group rules review'),
  tsEntry('ts14', 'p3', 'Client Portal v2', wk(5), 5, 'Responsive design implementation'),
  tsEntry('ts15', 'p2', 'NCODX Platform', wk(5), 4, 'CI/CD pipeline setup'),
  tsEntry('ts16', 'p1', 'Cloud Migration', wk(1) , 2, 'CloudFront distribution setup'),
  tsEntry('ts17', 'p3', 'Client Portal v2', wk(2), 3, 'Design system tokens'),
  tsEntry('ts18', 'p1', 'Cloud Migration', wk(3), 4, 'S3 bucket policies and encryption'),
  tsEntry('ts19', 'p2', 'NCODX Platform', wk(4), 3, 'E2E tests with Playwright'),
  tsEntry('ts20', 'p3', 'Client Portal v2', wk(5), 4, 'Performance optimization'),
];

// ─── Invoices ─────────────────────────────────────────────────────────────────
const mkItem = (id: string, desc: string, qty: number, price: number): InvoiceItem => ({
  id, description: desc, quantity: qty, unit_price: price, total: qty * price,
});

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1', projectId: 'p1', projectName: 'Cloud Migration',
    invoice_number: 'INV-2026-001', issue_date: '2026-02-01', due_date: '2026-02-28',
    subtotal: 5440, tax_rate: 16, tax_amount: 870.40, total: 6310.40, currency: 'USD',
    status: 'paid', notes: 'February timesheet — 64h @ $85/h',
    items: [
      mkItem('ii1', 'Cloud architecture & VPC setup', 20, 85),
      mkItem('ii2', 'RDS PostgreSQL configuration', 16, 85),
      mkItem('ii3', 'EC2 migration & testing', 16, 85),
      mkItem('ii4', 'Monitoring & alerting setup', 12, 85),
    ],
    createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'inv2', projectId: 'p3', projectName: 'Client Portal v2',
    invoice_number: 'INV-2026-002', issue_date: '2026-03-01', due_date: '2026-03-31',
    subtotal: 3610, tax_rate: 16, tax_amount: 577.60, total: 4187.60, currency: 'USD',
    status: 'sent', notes: 'March partial — 38h @ $95/h',
    items: [
      mkItem('ii5', 'UI/UX design system', 15, 95),
      mkItem('ii6', 'OAuth2 integration', 12, 95),
      mkItem('ii7', 'Responsive implementation', 11, 95),
    ],
    createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
  },
];

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const mockDashboardStats: DashboardStats = {
  totalTasks: mockTasks.length,
  completedToday: 3,
  pending: mockTasks.filter((t) => t.status === 'todo').length,
  activeProjects: mockProjects.filter((p) => p.status === 'active').length,
};

// ─── Repos Mock Data ──────────────────────────────────────────────────────────
export const mockBranches: Record<string, RepoBranch[]> = {
  'p1': [
    { name: 'main', sha: 'a1b2c3d', protected: true, lastCommit: 'fix: update subnet CIDR ranges', author: 'arturo' },
    { name: 'feature/rds-setup', sha: 'e4f5g6h', protected: false, lastCommit: 'feat: add multi-AZ RDS configuration', author: 'arturo' },
    { name: 'feature/monitoring', sha: 'i7j8k9l', protected: false, lastCommit: 'feat: add Datadog integration', author: 'arturo' },
    { name: 'hotfix/sg-rules', sha: 'm1n2o3p', protected: false, lastCommit: 'fix: restrict sg ingress rules', author: 'arturo' },
  ],
  'p2': [
    { name: 'main', sha: 'q4r5s6t', protected: true, lastCommit: 'feat: v2 signal theme complete', author: 'arturo' },
    { name: 'feature/kanban', sha: 'u7v8w9x', protected: false, lastCommit: 'feat: drag & drop kanban board', author: 'gerardo' },
    { name: 'feature/ai-chat', sha: 'y1z2a3b', protected: false, lastCommit: 'feat: Claude API integration', author: 'arturo' },
  ],
  'p3': [
    { name: 'main', sha: 'c4d5e6f', protected: true, lastCommit: 'feat: initial project setup', author: 'arturo' },
    { name: 'feature/oauth', sha: 'g7h8i9j', protected: false, lastCommit: 'feat: OAuth2 with Google provider', author: 'anastasia' },
    { name: 'feature/ui', sha: 'k1l2m3n', protected: false, lastCommit: 'design: new component library', author: 'anastasia' },
  ],
};

export const mockCommits: Record<string, RepoCommit[]> = {
  'p1': [
    { sha: 'a1b2c3d', message: 'fix: update subnet CIDR ranges', author: 'arturo', date: '2026-03-08T14:30:00Z', branch: 'main' },
    { sha: 'e4f5g6h', message: 'feat: add multi-AZ RDS configuration', author: 'arturo', date: '2026-03-07T11:00:00Z', branch: 'feature/rds-setup' },
    { sha: 'b2c3d4e', message: 'chore: update terraform provider versions', author: 'arturo', date: '2026-03-06T09:15:00Z', branch: 'main' },
    { sha: 'c3d4e5f', message: 'feat: add CloudFront OAC configuration', author: 'arturo', date: '2026-03-05T16:00:00Z', branch: 'main' },
    { sha: 'd4e5f6g', message: 'fix: resolve SG ingress conflicting rules', author: 'arturo', date: '2026-03-04T13:20:00Z', branch: 'main' },
  ],
  'p2': [
    { sha: 'q4r5s6t', message: 'feat: v2 signal theme complete', author: 'arturo', date: '2026-03-08T20:00:00Z', branch: 'main' },
    { sha: 'r5s6t7u', message: 'feat: terminal with xterm.js', author: 'arturo', date: '2026-03-07T18:00:00Z', branch: 'main' },
    { sha: 's6t7u8v', message: 'feat: timesheets and invoicing modules', author: 'arturo', date: '2026-03-06T15:00:00Z', branch: 'main' },
  ],
  'p3': [
    { sha: 'c4d5e6f', message: 'feat: initial project setup', author: 'arturo', date: '2026-01-10T08:00:00Z', branch: 'main' },
    { sha: 'd5e6f7g', message: 'design: new component library', author: 'anastasia', date: '2026-02-15T11:00:00Z', branch: 'feature/ui' },
    { sha: 'e6f7g8h', message: 'feat: OAuth2 with Google provider', author: 'anastasia', date: '2026-03-02T14:00:00Z', branch: 'feature/oauth' },
  ],
};

export const mockPRs: Record<string, RepoPR[]> = {
  'p1': [
    { id: 12, title: 'feat: RDS multi-AZ with read replicas', author: 'arturo', status: 'open', branch: 'feature/rds-setup', targetBranch: 'main', createdAt: '2026-03-07T11:00:00Z', reviewers: ['g.olmedof@gmail.com'] },
    { id: 11, title: 'feat: Datadog monitoring integration', author: 'arturo', status: 'merged', branch: 'feature/monitoring', targetBranch: 'main', createdAt: '2026-03-05T10:00:00Z', reviewers: [] },
    { id: 10, title: 'fix: security group ingress rules', author: 'arturo', status: 'open', branch: 'hotfix/sg-rules', targetBranch: 'main', createdAt: '2026-03-04T13:00:00Z', reviewers: ['g.olmedof@gmail.com'] },
  ],
  'p2': [
    { id: 8, title: 'feat: kanban drag & drop', author: 'gerardo', status: 'open', branch: 'feature/kanban', targetBranch: 'main', createdAt: '2026-03-06T09:00:00Z', reviewers: ['arturo.olmedof@hotmail.com'] },
    { id: 7, title: 'feat: Claude AI integration', author: 'arturo', status: 'merged', branch: 'feature/ai-chat', targetBranch: 'main', createdAt: '2026-03-01T10:00:00Z', reviewers: [] },
  ],
  'p3': [
    { id: 4, title: 'feat: OAuth2 with Google', author: 'anastasia', status: 'open', branch: 'feature/oauth', targetBranch: 'main', createdAt: '2026-03-02T14:00:00Z', reviewers: ['arturo.olmedof@hotmail.com'] },
    { id: 3, title: 'design: new component library', author: 'anastasia', status: 'open', branch: 'feature/ui', targetBranch: 'main', createdAt: '2026-02-15T11:00:00Z', reviewers: ['arturo.olmedof@hotmail.com'] },
  ],
};

// ─── Pipelines Mock Data ──────────────────────────────────────────────────────
export const mockPipelines: Record<string, Pipeline[]> = {
  'p1': [
    { id: 'pl1', name: 'terraform-apply-prod', status: 'success', branch: 'main', provider: 'azure', duration: '4m 32s', triggeredBy: 'arturo', timestamp: '2026-03-08T14:35:00Z', commit: 'a1b2c3d' },
    { id: 'pl2', name: 'terraform-apply-prod', status: 'failed', branch: 'main', provider: 'azure', duration: '1m 12s', triggeredBy: 'arturo', timestamp: '2026-03-07T10:00:00Z', commit: 'b2c3d4e' },
    { id: 'pl3', name: 'build-and-push-ecr', status: 'success', branch: 'main', provider: 'github', duration: '2m 48s', triggeredBy: 'arturo', timestamp: '2026-03-06T16:05:00Z', commit: 'c3d4e5f' },
    { id: 'pl4', name: 'deploy-ecs-prod', status: 'running', branch: 'feature/rds-setup', provider: 'aws', duration: '—', triggeredBy: 'arturo', timestamp: '2026-03-08T15:00:00Z' },
    { id: 'pl5', name: 'security-scan', status: 'success', branch: 'main', provider: 'github', duration: '3m 15s', triggeredBy: 'schedule', timestamp: '2026-03-08T02:00:00Z' },
  ],
  'p2': [
    { id: 'pl6', name: 'build-web', status: 'success', branch: 'main', provider: 'github', duration: '1m 45s', triggeredBy: 'arturo', timestamp: '2026-03-08T20:05:00Z', commit: 'q4r5s6t' },
    { id: 'pl7', name: 'deploy-cloudfront', status: 'success', branch: 'main', provider: 'github', duration: '0m 52s', triggeredBy: 'arturo', timestamp: '2026-03-08T20:07:00Z', commit: 'q4r5s6t' },
    { id: 'pl8', name: 'build-api', status: 'failed', branch: 'main', provider: 'azure', duration: '2m 10s', triggeredBy: 'arturo', timestamp: '2026-03-07T18:15:00Z', commit: 'r5s6t7u' },
  ],
  'p3': [
    { id: 'pl9', name: 'build-portal', status: 'success', branch: 'main', provider: 'azure', duration: '3m 20s', triggeredBy: 'anastasia', timestamp: '2026-03-05T14:00:00Z', commit: 'c4d5e6f' },
    { id: 'pl10', name: 'deploy-staging', status: 'queued', branch: 'feature/oauth', provider: 'azure', duration: '—', triggeredBy: 'anastasia', timestamp: '2026-03-08T15:30:00Z' },
  ],
};
