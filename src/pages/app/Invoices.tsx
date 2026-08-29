import { useMemo, useState } from 'react';
import { CheckCircle2, FileText, Plus, Send, Trash2 } from 'lucide-react';
import {
  Badge, Button, Card, CardBody, EmptyState, ErrorState, Field, Input, Modal,
  PageHeader, PageShell, SearchInput, Select, Skeleton, StatTile, Textarea,
  type Tone,
} from '@/components/ui';
import { invoicesResource, useInvoice, useInvoiceAction, useInvoices, useProjectMap } from '@/hooks/queries';
import { formatCurrency, formatDate } from '@/lib/format';
import type { InvoiceStatus } from '@/types';

const STATUS_TONE: Record<InvoiceStatus, Tone> = {
  draft: 'neutral', sent: 'info', paid: 'positive', overdue: 'critical', cancelled: 'neutral',
};

const STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

function todayISO() { return new Date().toISOString().slice(0, 10); }
function plusDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function Invoices() {
  const { projects, map } = useProjectMap();
  const [status, setStatus] = useState<'' | InvoiceStatus>('');
  const [query, setQuery] = useState('');
  const { data, isPending, isError, error, refetch } = useInvoices(status ? { status } : undefined);
  const createInvoice = invoicesResource.useCreate();
  const removeInvoice = invoicesResource.useRemove();
  const runAction = useInvoiceAction();

  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const detail = useInvoice(openId ?? undefined);

  const [form, setForm] = useState({
    projectId: '', invoiceNumber: '', issueDate: todayISO(), dueDate: plusDaysISO(30),
    subtotal: '', taxRate: '0.16', notes: '',
  });

  const invoices = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data ?? [])
      .filter((inv) => !term || inv.invoiceNumber.toLowerCase().includes(term))
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  }, [data, query]);

  const pending = invoices.filter((i) => i.status === 'sent' || i.status === 'overdue');
  const pendingTotal = pending.reduce((s, i) => s + i.total, 0);
  const paidTotal = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const subtotal = Number(form.subtotal);
    const taxRate = Number(form.taxRate);
    if (!form.projectId || !form.invoiceNumber.trim() || !Number.isFinite(subtotal)) return;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    await createInvoice.mutateAsync({
      projectId: form.projectId,
      invoiceNumber: form.invoiceNumber.trim(),
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      subtotal,
      taxRate,
      taxAmount,
      total: subtotal + taxAmount,
      currency: map.get(form.projectId)?.currency ?? 'USD',
      status: 'draft',
      notes: form.notes.trim() || null,
    });
    setCreating(false);
    setForm({ ...form, invoiceNumber: '', subtotal: '', notes: '' });
  }

  return (
    <PageShell>
      <PageHeader
        title="Invoices"
        description="Billing across every client."
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={15} />
            New invoice
          </Button>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {isPending ? (
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[104px]" />)
        ) : (
          <>
            <StatTile icon={FileText} label="Outstanding" value={formatCurrency(pendingTotal, 'USD', { compact: true })} upIsGood={false} />
            <StatTile label="Collected" value={formatCurrency(paidTotal, 'USD', { compact: true })} />
            <StatTile label="Invoices" value={invoices.length} />
          </>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-72">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by number…" />
        </div>
        <div className="w-44">
          <Select value={status} onChange={(e) => setStatus(e.target.value as '' | InvoiceStatus)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </Select>
        </div>
      </div>

      <Card className="mt-3 overflow-hidden">
        {isPending ? (
          <CardBody className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-11" />)}
          </CardBody>
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices"
            description="Create one to bill a client for tracked work."
            action={<Button size="sm" variant="primary" onClick={() => setCreating(true)}><Plus size={14} />New invoice</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[12px] text-ink-faint">
                  <th className="px-4 py-2.5 font-medium">Number</th>
                  <th className="px-4 py-2.5 font-medium">Project</th>
                  <th className="px-4 py-2.5 font-medium">Issued</th>
                  <th className="px-4 py-2.5 font-medium">Due</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="group transition-colors hover:bg-raised/50">
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => setOpenId(invoice.id)}
                        className="font-mono text-ink hover:text-brand hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-ink-dim">{map.get(invoice.projectId)?.name ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{formatDate(invoice.issueDate)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{formatDate(invoice.dueDate)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-ink">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </td>
                    <td className="px-4 py-2.5"><Badge tone={STATUS_TONE[invoice.status]}>{invoice.status}</Badge></td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                        {invoice.status === 'draft' && (
                          <Button size="sm" variant="ghost" title="Send"
                            onClick={() => runAction.mutate({ id: invoice.id, action: 'send' })}>
                            <Send size={13} />
                          </Button>
                        )}
                        {invoice.status !== 'paid' && (
                          <Button size="sm" variant="ghost" title="Mark paid"
                            onClick={() => runAction.mutate({ id: invoice.id, action: 'mark-paid' })}>
                            <CheckCircle2 size={13} />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" title="Delete"
                          className="hover:text-critical"
                          onClick={() => removeInvoice.mutate(invoice.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail */}
      <Modal
        open={openId !== null}
        onClose={() => setOpenId(null)}
        size="lg"
        title={detail.data?.invoiceNumber ?? 'Invoice'}
        description={detail.data ? map.get(detail.data.projectId)?.name ?? undefined : undefined}
      >
        {detail.isPending ? (
          <div className="space-y-2">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : detail.data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-4">
              <div><p className="text-ink-faint">Issued</p><p className="text-ink">{formatDate(detail.data.issueDate)}</p></div>
              <div><p className="text-ink-faint">Due</p><p className="text-ink">{formatDate(detail.data.dueDate)}</p></div>
              <div><p className="text-ink-faint">Status</p><Badge tone={STATUS_TONE[detail.data.status]}>{detail.data.status}</Badge></div>
              <div><p className="text-ink-faint">Currency</p><p className="text-ink">{detail.data.currency}</p></div>
            </div>

            {detail.data.items && detail.data.items.length > 0 && (
              <div className="overflow-hidden rounded-md border border-line">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-line bg-raised/40 text-[12px] text-ink-faint">
                      <th className="px-3 py-2 font-medium">Description</th>
                      <th className="px-3 py-2 text-right font-medium">Qty</th>
                      <th className="px-3 py-2 text-right font-medium">Unit</th>
                      <th className="px-3 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {detail.data.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-ink">{item.description}</td>
                        <td className="px-3 py-2 text-right text-ink-dim">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-ink-dim">{formatCurrency(item.unitPrice, detail.data!.currency)}</td>
                        <td className="px-3 py-2 text-right font-medium text-ink">{formatCurrency(item.total, detail.data!.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <dl className="ml-auto w-full max-w-xs space-y-1.5 text-[13px]">
              <div className="flex justify-between"><dt className="text-ink-faint">Subtotal</dt><dd className="text-ink">{formatCurrency(detail.data.subtotal, detail.data.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-faint">Tax ({Math.round(detail.data.taxRate * 100)}%)</dt><dd className="text-ink">{formatCurrency(detail.data.taxAmount, detail.data.currency)}</dd></div>
              <div className="flex justify-between border-t border-line pt-1.5 font-medium"><dt className="text-ink">Total</dt><dd className="text-ink">{formatCurrency(detail.data.total, detail.data.currency)}</dd></div>
            </dl>

            {detail.data.notes && (
              <div className="rounded-md border border-line bg-canvas p-3">
                <p className="eyebrow mb-1">Notes</p>
                <p className="text-[13px] leading-relaxed text-ink-dim">{detail.data.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <ErrorState message="Invoice not found." />
        )}
      </Modal>

      {/* Create */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New invoice"
        footer={
          <>
            <Button onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="new-invoice" loading={createInvoice.isPending}
              disabled={!form.projectId || !form.invoiceNumber.trim() || !form.subtotal}>
              Create invoice
            </Button>
          </>
        }
      >
        <form id="new-invoice" onSubmit={handleCreate} className="space-y-4">
          <Field label="Project" required htmlFor="ni-project">
            <Select id="ni-project" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">Select a project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Invoice number" required htmlFor="ni-number">
            <Input id="ni-number" value={form.invoiceNumber} placeholder="INV-2026-003"
              onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Issue date" htmlFor="ni-issue">
              <Input id="ni-issue" type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
            </Field>
            <Field label="Due date" htmlFor="ni-due">
              <Input id="ni-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subtotal" required htmlFor="ni-subtotal">
              <Input id="ni-subtotal" type="number" min="0" step="0.01" value={form.subtotal}
                onChange={(e) => setForm({ ...form, subtotal: e.target.value })} />
            </Field>
            <Field label="Tax rate" hint="0.16 = 16%" htmlFor="ni-tax">
              <Input id="ni-tax" type="number" min="0" max="1" step="0.01" value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: e.target.value })} />
            </Field>
          </div>
          <Field label="Notes" htmlFor="ni-notes">
            <Textarea id="ni-notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </form>
      </Modal>
    </PageShell>
  );
}
