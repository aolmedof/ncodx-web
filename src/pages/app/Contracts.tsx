import { useMemo, useState } from 'react';
import { FileSignature, Plus, Trash2 } from 'lucide-react';
import {
  Badge, Button, Card, EmptyState, ErrorState, Field, Input, Modal,
  PageHeader, PageShell, Select, Skeleton, StatTile, Textarea, type Tone,
} from '@/components/ui';
import { contractsResource, useContracts, useProjectMap } from '@/hooks/queries';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Contract, ContractStatus, ContractType } from '@/types';

const STATUS_TONE: Record<ContractStatus, Tone> = {
  active: 'positive', paused: 'caution', completed: 'info', cancelled: 'neutral',
};
const TYPES: ContractType[] = ['hourly', 'monthly', 'fixed', 'retainer'];
const STATUSES: ContractStatus[] = ['active', 'paused', 'completed', 'cancelled'];

const RATE_SUFFIX: Record<ContractType, string> = {
  hourly: '/hr', monthly: '/mo', fixed: '', retainer: '/mo',
};

const BLANK = {
  projectId: '', title: '', type: 'hourly' as ContractType, rate: '',
  currency: 'USD', startDate: new Date().toISOString().slice(0, 10),
  endDate: '', status: 'active' as ContractStatus, notes: '',
};

export function Contracts() {
  const { projects, map } = useProjectMap();
  const [status, setStatus] = useState<'' | ContractStatus>('');
  const { data, isPending, isError, error, refetch } = useContracts(status ? { status } : undefined);
  const createContract = contractsResource.useCreate();
  const updateContract = contractsResource.useUpdate();
  const removeContract = contractsResource.useRemove();

  const [editing, setEditing] = useState<Contract | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(BLANK);

  const contracts = useMemo(
    () => [...(data ?? [])].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [data],
  );
  const active = contracts.filter((c) => c.status === 'active');
  const monthlyValue = active
    .filter((c) => c.type === 'monthly' || c.type === 'retainer')
    .reduce((sum, c) => sum + c.rate, 0);

  function startCreate() {
    setEditing(null);
    setForm(BLANK);
    setOpen(true);
  }

  function startEdit(contract: Contract) {
    setEditing(contract);
    setForm({
      projectId: contract.projectId,
      title: contract.title,
      type: contract.type,
      rate: String(contract.rate),
      currency: contract.currency,
      startDate: contract.startDate.slice(0, 10),
      endDate: contract.endDate?.slice(0, 10) ?? '',
      status: contract.status,
      notes: contract.notes ?? '',
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rate = Number(form.rate);
    if (!form.projectId || !form.title.trim() || !Number.isFinite(rate)) return;
    const payload = {
      projectId: form.projectId,
      title: form.title.trim(),
      type: form.type,
      rate,
      currency: form.currency,
      startDate: form.startDate,
      endDate: form.endDate || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };
    if (editing) await updateContract.mutateAsync({ id: editing.id, ...payload });
    else await createContract.mutateAsync(payload);
    setOpen(false);
  }

  const saving = createContract.isPending || updateContract.isPending;

  return (
    <PageShell>
      <PageHeader
        title="Contracts"
        description="Rates and terms agreed with each client."
        actions={<Button variant="primary" onClick={startCreate}><Plus size={15} />New contract</Button>}
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {isPending ? (
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <StatTile icon={FileSignature} label="Active contracts" value={active.length} />
            <StatTile label="Recurring value" value={formatCurrency(monthlyValue, 'USD', { compact: true })} />
            <StatTile label="Total contracts" value={contracts.length} />
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="w-44">
          <Select value={status} onChange={(e) => setStatus(e.target.value as '' | ContractStatus)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </Select>
        </div>
      </div>

      <div className="mt-3">
        {isPending ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36" />)}
          </div>
        ) : isError ? (
          <Card><ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} /></Card>
        ) : contracts.length === 0 ? (
          <Card>
            <EmptyState
              icon={FileSignature}
              title="No contracts"
              description="Record the rate and terms you agreed with a client."
              action={<Button size="sm" variant="primary" onClick={startCreate}><Plus size={14} />New contract</Button>}
            />
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {contracts.map((contract) => {
              const project = map.get(contract.projectId);
              return (
                <Card key={contract.id} className="group p-4">
                  <div className="flex items-start gap-2.5">
                    <span
                      aria-hidden
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: project?.color ?? 'var(--color-line-strong)' }}
                    />
                    <div className="min-w-0 flex-1">
                      <button onClick={() => startEdit(contract)} className="block truncate text-left font-medium text-ink hover:text-brand">
                        {contract.title}
                      </button>
                      <p className="truncate text-[13px] text-ink-faint">{project?.name ?? 'Unknown project'}</p>
                    </div>
                    <Badge tone={STATUS_TONE[contract.status]} dot>{contract.status}</Badge>
                  </div>

                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-lg font-semibold text-ink">
                      {formatCurrency(contract.rate, contract.currency)}
                    </span>
                    <span className="text-[13px] text-ink-faint">
                      {RATE_SUFFIX[contract.type]} · {contract.type}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[12px] text-ink-faint">
                    <span>{formatDate(contract.startDate)} → {contract.endDate ? formatDate(contract.endDate) : 'ongoing'}</span>
                    <button
                      onClick={() => removeContract.mutate(contract.id)}
                      aria-label="Delete contract"
                      className="rounded p-1 opacity-0 transition hover:bg-critical-soft hover:text-critical group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit contract' : 'New contract'}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="contract-form" loading={saving}
              disabled={!form.projectId || !form.title.trim() || !form.rate}>
              {editing ? 'Save changes' : 'Create contract'}
            </Button>
          </>
        }
      >
        <form id="contract-form" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Project" required htmlFor="c-project">
            <Select id="c-project" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">Select a project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Title" required htmlFor="c-title">
            <Input id="c-title" value={form.title} placeholder="Monthly retainer 2026"
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Type" htmlFor="c-type">
              <Select id="c-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ContractType })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Rate" required htmlFor="c-rate">
              <Input id="c-rate" type="number" min="0" step="0.01" value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })} />
            </Field>
            <Field label="Currency" htmlFor="c-currency">
              <Select id="c-currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="USD">USD</option><option value="EUR">EUR</option><option value="MXN">MXN</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date" htmlFor="c-start">
              <Input id="c-start" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="End date" hint="Leave blank if ongoing" htmlFor="c-end">
              <Input id="c-end" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Field>
          </div>
          <Field label="Status" htmlFor="c-status">
            <Select id="c-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ContractStatus })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Notes" htmlFor="c-notes">
            <Textarea id="c-notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </form>
      </Modal>
    </PageShell>
  );
}
