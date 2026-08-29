import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Check, Plug, Trash2 } from 'lucide-react';
import {
  Badge, Button, Card, CardBody, CardHeader, EmptyState, Field, Input, Modal,
  PageHeader, PageShell, Select, Skeleton, Textarea,
} from '@/components/ui';
import { projectsResource, useIntegrations, useProject } from '@/hooks/queries';
import { formatDate } from '@/lib/format';
import type { Project, ProjectStatus } from '@/types';

const STATUSES: ProjectStatus[] = ['active', 'paused', 'completed', 'archived'];
const PRESET_COLORS = ['#3ecf8e', '#3987e5', '#d95926', '#a855f7', '#e3b341', '#f2666b'];

function toForm(project: Project) {
  return {
    name: project.name,
    description: project.description ?? '',
    color: project.color,
    icon: project.icon ?? '',
    status: project.status,
    clientName: project.clientName ?? '',
    clientEmail: project.clientEmail ?? '',
    hourlyRate: project.hourlyRate != null ? String(project.hourlyRate) : '',
    monthlyRate: project.monthlyRate != null ? String(project.monthlyRate) : '',
    currency: project.currency ?? 'USD',
    githubRepo: project.githubRepo ?? '',
    azureDevopsOrg: project.azureDevopsOrg ?? '',
    azureDevopsProject: project.azureDevopsProject ?? '',
    awsAccountId: project.awsAccountId ?? '',
    awsRegion: project.awsRegion ?? '',
    jumpserverUsername: project.jumpserverUsername ?? '',
  };
}

/** Mounted only once the project has loaded, so the form seeds from props. */
function ProjectSettingsForm({ project }: { project: Project }) {
  const projectId = project.id;
  const navigate = useNavigate();
  const integrations = useIntegrations({ project_id: projectId });
  const updateProject = projectsResource.useUpdate();
  const removeProject = projectsResource.useRemove();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(() => toForm(project));

  const numberOrNull = (value: string) => (value.trim() === '' ? null : Number(value));
  const textOrNull = (value: string) => (value.trim() === '' ? null : value.trim());

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !form.name.trim()) return;
    await updateProject.mutateAsync({
      id: projectId,
      name: form.name.trim(),
      description: textOrNull(form.description),
      color: form.color,
      icon: textOrNull(form.icon),
      status: form.status,
      clientName: textOrNull(form.clientName),
      clientEmail: textOrNull(form.clientEmail),
      hourlyRate: numberOrNull(form.hourlyRate),
      monthlyRate: numberOrNull(form.monthlyRate),
      currency: form.currency,
      githubRepo: textOrNull(form.githubRepo),
      azureDevopsOrg: textOrNull(form.azureDevopsOrg),
      azureDevopsProject: textOrNull(form.azureDevopsProject),
      awsAccountId: textOrNull(form.awsAccountId),
      awsRegion: textOrNull(form.awsRegion),
      jumpserverUsername: textOrNull(form.jumpserverUsername),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDelete() {
    if (!projectId) return;
    await removeProject.mutateAsync(projectId);
    navigate('/app');
  }

  return (
    <PageShell>
      <PageHeader
        title="Project settings"
        description="Client details, rates and the integrations this project reads from."
        actions={
          <Button variant="primary" type="submit" form="project-settings" loading={updateProject.isPending}>
            {saved ? <><Check size={15} />Saved</> : 'Save changes'}
          </Button>
        }
      />

      <form id="project-settings" onSubmit={handleSave} className="mt-5 space-y-3">
        <Card>
          <CardHeader title="General" />
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <Field label="Name" required htmlFor="ps-name">
                <Input id="ps-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Icon" hint="One emoji" htmlFor="ps-icon">
                <Input id="ps-icon" className="w-20 text-center" maxLength={2}
                  value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </Field>
            </div>
            <Field label="Description" htmlFor="ps-desc">
              <Textarea id="ps-desc" rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status" htmlFor="ps-status">
                <Select id="ps-status" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Colour">
                <div className="flex h-9 items-center gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button key={color} type="button" aria-label={`Colour ${color}`}
                      onClick={() => setForm({ ...form, color })}
                      style={{ backgroundColor: color }}
                      className={'h-6 w-6 rounded-full transition-transform ' +
                        (form.color === color ? 'ring-2 ring-brand ring-offset-2 ring-offset-card' : 'hover:scale-110')}
                    />
                  ))}
                </div>
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Client & rates" />
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Client name" htmlFor="ps-client">
                <Input id="ps-client" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
              </Field>
              <Field label="Client email" htmlFor="ps-cemail">
                <Input id="ps-cemail" type="email" value={form.clientEmail}
                  onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Hourly rate" htmlFor="ps-hourly">
                <Input id="ps-hourly" type="number" min="0" step="0.01" value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
              </Field>
              <Field label="Monthly rate" htmlFor="ps-monthly">
                <Input id="ps-monthly" type="number" min="0" step="0.01" value={form.monthlyRate}
                  onChange={(e) => setForm({ ...form, monthlyRate: e.target.value })} />
              </Field>
              <Field label="Currency" htmlFor="ps-currency">
                <Select id="ps-currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="USD">USD</option><option value="EUR">EUR</option><option value="MXN">MXN</option>
                </Select>
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Integrations" description="Where this project pulls repos, pipelines and infrastructure from." />
          <CardBody className="space-y-4">
            <Field label="GitHub repository" hint="owner/repo" htmlFor="ps-gh">
              <Input id="ps-gh" className="font-mono" placeholder="aolmedof/ncodx-api"
                value={form.githubRepo} onChange={(e) => setForm({ ...form, githubRepo: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Azure DevOps org" htmlFor="ps-azo">
                <Input id="ps-azo" className="font-mono" value={form.azureDevopsOrg}
                  onChange={(e) => setForm({ ...form, azureDevopsOrg: e.target.value })} />
              </Field>
              <Field label="Azure DevOps project" htmlFor="ps-azp">
                <Input id="ps-azp" className="font-mono" value={form.azureDevopsProject}
                  onChange={(e) => setForm({ ...form, azureDevopsProject: e.target.value })} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="AWS account" htmlFor="ps-aws">
                <Input id="ps-aws" className="font-mono" value={form.awsAccountId}
                  onChange={(e) => setForm({ ...form, awsAccountId: e.target.value })} />
              </Field>
              <Field label="AWS region" htmlFor="ps-region">
                <Input id="ps-region" className="font-mono" placeholder="eu-west-3" value={form.awsRegion}
                  onChange={(e) => setForm({ ...form, awsRegion: e.target.value })} />
              </Field>
              <Field label="Jumpserver user" htmlFor="ps-jump">
                <Input id="ps-jump" className="font-mono" value={form.jumpserverUsername}
                  onChange={(e) => setForm({ ...form, jumpserverUsername: e.target.value })} />
              </Field>
            </div>
          </CardBody>
        </Card>
      </form>

      <Card className="mt-3">
        <CardHeader title="Connected tokens" description="Credentials stored for this project." />
        {integrations.isPending ? (
          <CardBody className="space-y-2">
            {Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-10" />)}
          </CardBody>
        ) : (integrations.data ?? []).length === 0 ? (
          <EmptyState icon={Plug} title="No tokens connected" description="Connect a provider to sync repos and pipelines." />
        ) : (
          <ul className="divide-y divide-line">
            {(integrations.data ?? []).map((integration) => (
              <li key={integration.id} className="flex items-center gap-3 px-4 py-2.5">
                <Plug size={14} className="shrink-0 text-ink-faint" />
                <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">{integration.provider}</span>
                {integration.scopes && (
                  <span className="hidden truncate font-mono text-[12px] text-ink-faint md:block">{integration.scopes}</span>
                )}
                <Badge tone={
                  integration.tokenExpiry && new Date(integration.tokenExpiry) < new Date() ? 'critical' : 'positive'
                }>
                  {integration.tokenExpiry ? `expires ${formatDate(integration.tokenExpiry)}` : 'no expiry'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-3 border-critical/25">
        <CardHeader title="Danger zone" description="Deleting a project also removes its contracts, timesheets and invoices." />
        <CardBody>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={15} />Delete this project
          </Button>
        </CardBody>
      </Card>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        size="sm"
        title="Delete this project?"
        footer={
          <>
            <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={removeProject.isPending}>
              Delete permanently
            </Button>
          </>
        }
      >
        <div className="flex gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-critical" />
          <p className="text-[13px] leading-relaxed text-ink-dim">
            <span className="font-medium text-ink">{project.name}</span> and everything attached to it —
            contracts, timesheets, invoices and integration tokens — will be removed. Tasks are detached
            rather than deleted. This cannot be undone.
          </p>
        </div>
      </Modal>
    </PageShell>
  );
}

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isPending } = useProject(projectId);

  if (isPending || !project) {
    return (
      <PageShell>
        <Skeleton className="h-8 w-48" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </PageShell>
    );
  }

  return <ProjectSettingsForm project={project} />;
}
