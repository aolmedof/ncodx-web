import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, Plus } from 'lucide-react';
import {
  Badge, Button, Card, EmptyState, ErrorState, Field, Input, Modal, PageHeader,
  PageShell, SearchInput, Select, Skeleton, Textarea, type Tone,
} from '@/components/ui';
import { projectsResource, useProjects } from '@/hooks/queries';
import { formatCurrency, formatRelative } from '@/lib/format';
import type { ProjectStatus } from '@/types';

const STATUS_TONE: Record<ProjectStatus, Tone> = {
  active: 'positive',
  paused: 'caution',
  completed: 'info',
  archived: 'neutral',
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
};

const PRESET_COLORS = ['#3ecf8e', '#3987e5', '#d95926', '#a855f7', '#e3b341', '#f2666b'];

export default function ProjectSelector() {
  const navigate = useNavigate();
  const { data: projects, isPending, isError, error, refetch } = useProjects();
  const createProject = projectsResource.useCreate();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ProjectStatus>('all');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', clientName: '', color: PRESET_COLORS[0] });

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (projects ?? []).filter((project) => {
      if (status !== 'all' && project.status !== status) return false;
      if (!term) return true;
      return (
        project.name.toLowerCase().includes(term) ||
        (project.clientName ?? '').toLowerCase().includes(term) ||
        (project.description ?? '').toLowerCase().includes(term)
      );
    });
  }, [projects, query, status]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const created = await createProject.mutateAsync({
      name: form.name.trim(),
      description: form.description.trim() || null,
      clientName: form.clientName.trim() || null,
      color: form.color,
      status: 'active',
    });
    setCreating(false);
    setForm({ name: '', description: '', clientName: '', color: PRESET_COLORS[0] });
    if (created?.id) navigate(`/app/p/${created.id}`);
  }

  return (
    <PageShell>
      <PageHeader
        title="Projects"
        description="Every engagement you are tracking, with its client and rate."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={15} />
            New project
          </Button>
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-72">
          <SearchInput value={query} onChange={setQuery} placeholder="Search projects or clients…" />
        </div>
        <div className="w-44">
          <Select value={status} onChange={(e) => setStatus(e.target.value as 'all' | ProjectStatus)}>
            <option value="all">All statuses</option>
            {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((key) => (
              <option key={key} value={key}>{STATUS_LABEL[key]}</option>
            ))}
          </Select>
        </div>
        {!isPending && !isError && (
          <span className="ml-auto text-[13px] text-ink-faint">
            {visible.length} of {projects?.length ?? 0}
          </span>
        )}
      </div>

      <div className="mt-4">
        {isPending ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : isError ? (
          <ErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
          />
        ) : visible.length === 0 ? (
          <Card>
            <EmptyState
              icon={FolderGit2}
              title={projects?.length ? 'No projects match those filters' : 'No projects yet'}
              description={
                projects?.length
                  ? 'Try a different search term or status.'
                  : 'Create your first project to start tracking work, time and invoices.'
              }
              action={
                projects?.length ? (
                  <Button size="sm" onClick={() => { setQuery(''); setStatus('all'); }}>
                    Clear filters
                  </Button>
                ) : (
                  <Button size="sm" variant="primary" onClick={() => setCreating(true)}>
                    <Plus size={14} />
                    New project
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((project) => {
              const rate =
                project.hourlyRate
                  ? `${formatCurrency(project.hourlyRate, project.currency ?? 'USD')}/hr`
                  : project.monthlyRate
                    ? `${formatCurrency(project.monthlyRate, project.currency ?? 'USD')}/mo`
                    : null;

              return (
                <Card
                  key={project.id}
                  interactive
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/app/p/${project.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/app/p/${project.id}`);
                    }
                  }}
                  className="flex h-full cursor-pointer flex-col p-4"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">
                        {project.icon ? `${project.icon} ` : ''}{project.name}
                      </p>
                      {project.clientName && (
                        <p className="truncate text-[13px] text-ink-faint">{project.clientName}</p>
                      )}
                    </div>
                    <Badge tone={STATUS_TONE[project.status]} dot>
                      {STATUS_LABEL[project.status]}
                    </Badge>
                  </div>

                  {project.description && (
                    <p className="mb-4 mt-3 line-clamp-2 text-[13px] leading-relaxed text-ink-dim">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-[12px]">
                    <span className="text-ink-faint">Updated {formatRelative(project.updatedAt)}</span>
                    {rate && <span className="font-medium text-ink-dim">{rate}</span>}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New project"
        description="You can fill in rates and integrations later in project settings."
        footer={
          <>
            <Button onClick={() => setCreating(false)}>Cancel</Button>
            <Button
              variant="primary"
              form="new-project"
              type="submit"
              loading={createProject.isPending}
              disabled={!form.name.trim()}
            >
              Create project
            </Button>
          </>
        }
      >
        <form id="new-project" onSubmit={handleCreate} className="space-y-4">
          <Field label="Name" required htmlFor="np-name">
            <Input
              id="np-name"
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Portal Santander"
            />
          </Field>
          <Field label="Client" htmlFor="np-client">
            <Input
              id="np-client"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              placeholder="Santander Digital"
            />
          </Field>
          <Field label="Description" htmlFor="np-desc">
            <Textarea
              id="np-desc"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What this engagement covers."
            />
          </Field>
          <Field label="Colour">
            <div className="flex gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Colour ${color}`}
                  onClick={() => setForm({ ...form, color })}
                  style={{ backgroundColor: color }}
                  className={
                    'h-7 w-7 rounded-full transition-transform ' +
                    (form.color === color
                      ? 'ring-2 ring-brand ring-offset-2 ring-offset-surface'
                      : 'hover:scale-110')
                  }
                />
              ))}
            </div>
          </Field>
          {createProject.isError && (
            <p className="text-[13px] text-critical">
              {createProject.error instanceof Error ? createProject.error.message : 'Could not create the project.'}
            </p>
          )}
        </form>
      </Modal>
    </PageShell>
  );
}
