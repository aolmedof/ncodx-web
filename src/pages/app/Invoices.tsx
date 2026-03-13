import { useState } from 'react';
import {
  Plus, X, Eye, Send, CheckCircle, Download, Trash2, FileText,
} from 'lucide-react';
import { mockInvoices, mockProjects } from '@/lib/mock-data';
import type { Invoice, InvoiceItem, InvoiceStatus } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function newItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: 'bg-slate-700/40 text-slate-300 border border-slate-600/40',
  sent: 'bg-blue-900/30 text-blue-300 border border-blue-700/40',
  paid: 'bg-signal-green/20 text-signal-green border border-signal-green/30',
  overdue: 'bg-red-900/30 text-red-300 border border-red-700/40',
  cancelled: 'bg-slate-700/40 text-slate-400 border border-slate-600/40',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

// ─── Empty form state ─────────────────────────────────────────────────────────
interface InvoiceFormState {
  projectId: string;
  issue_date: string;
  due_date: string;
  tax_rate: number;
  notes: string;
  items: InvoiceItem[];
  currency: string;
}

const emptyForm = (): InvoiceFormState => ({
  projectId: mockProjects[0]?.id ?? '',
  issue_date: new Date().toISOString().split('T')[0],
  due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  tax_rate: 16,
  notes: '',
  currency: 'USD',
  items: [{ id: newItemId(), description: '', quantity: 1, unit_price: 0, total: 0 }],
});

// ─── Component ────────────────────────────────────────────────────────────────
export function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [showModal, setShowModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<InvoiceFormState>(emptyForm());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Summary stats ──────────────────────────────────────────────────────────
  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalOutstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + i.total, 0);
  const totalDraft = invoices.filter((i) => i.status === 'draft').reduce((s, i) => s + i.total, 0);

  // ─── Form helpers ───────────────────────────────────────────────────────────
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.total = updated.quantity * updated.unit_price;
        return updated;
      }),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { id: newItemId(), description: '', quantity: 1, unit_price: 0, total: 0 }],
    }));
  };

  const removeItem = (id: string) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) }));
  };

  const subtotal = form.items.reduce((s, i) => s + i.total, 0);
  const taxAmount = subtotal * (form.tax_rate / 100);
  const total = subtotal + taxAmount;

  const handleCreateInvoice = () => {
    const project = mockProjects.find((p) => p.id === form.projectId);
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      projectId: form.projectId,
      projectName: project?.name ?? '',
      invoice_number: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      issue_date: form.issue_date,
      due_date: form.due_date,
      subtotal,
      tax_rate: form.tax_rate,
      tax_amount: taxAmount,
      total,
      currency: form.currency,
      status: 'draft',
      notes: form.notes,
      items: form.items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    setShowModal(false);
    setForm(emptyForm());
    showToast('Invoice created successfully');
  };

  const handleStatusChange = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
    const msgs: Record<string, string> = {
      sent: 'Invoice sent to client',
      paid: 'Invoice marked as paid',
    };
    if (msgs[status]) showToast(msgs[status]);
  };

  const handleDelete = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    showToast('Invoice deleted');
  };

  // ─── Input class ────────────────────────────────────────────────────────────
  const inputCls =
    'w-full px-3 py-2 bg-signal-bg border border-signal-border rounded-lg text-signal-text text-sm focus:outline-none focus:border-signal-border-bright transition-colors';

  return (
    <div className="p-6 min-h-screen bg-signal-bg">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-signal-green/20 border border-signal-green text-signal-green px-4 py-3 rounded-xl shadow-signal-card">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-signal-text">Invoices</h2>
          <p className="text-signal-text-muted text-sm mt-0.5">{invoices.length} invoices total</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm()); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-signal-green text-signal-bg rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          New Invoice
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Invoiced', value: totalInvoiced, color: 'text-signal-text' },
          { label: 'Paid', value: totalPaid, color: 'text-signal-green' },
          { label: 'Outstanding', value: totalOutstanding, color: 'text-amber-400' },
          { label: 'Draft', value: totalDraft, color: 'text-signal-text-dim' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-signal-surface border border-signal-border rounded-xl p-4 shadow-signal-card"
          >
            <p className="text-signal-text-muted text-xs mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-signal-surface border border-signal-border rounded-xl overflow-hidden shadow-signal-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-signal-border">
                {['Invoice #', 'Project', 'Issue Date', 'Due Date', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-signal-text-muted font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-signal-border hover:bg-signal-card/40 transition-colors"
                >
                  <td className="px-4 py-3 text-signal-text font-mono text-xs">{inv.invoice_number}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: mockProjects.find((p) => p.id === inv.projectId)?.color ?? '#888' }}
                      />
                      <span className="text-signal-text">{inv.projectName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-signal-text-dim">{formatDate(inv.issue_date)}</td>
                  <td className="px-4 py-3 text-signal-text-dim">{formatDate(inv.due_date)}</td>
                  <td className="px-4 py-3 text-signal-text font-semibold">
                    {formatCurrency(inv.total, inv.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[inv.status]}`}>
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewInvoice(inv)}
                        title="View"
                        className="p-1.5 rounded-lg text-signal-text-muted hover:text-signal-text hover:bg-signal-card transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      {inv.status === 'draft' && (
                        <button
                          onClick={() => handleStatusChange(inv.id, 'sent')}
                          title="Send"
                          className="p-1.5 rounded-lg text-signal-text-muted hover:text-blue-300 hover:bg-signal-card transition-colors"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      {(inv.status === 'sent' || inv.status === 'overdue') && (
                        <button
                          onClick={() => handleStatusChange(inv.id, 'paid')}
                          title="Mark Paid"
                          className="p-1.5 rounded-lg text-signal-text-muted hover:text-signal-green hover:bg-signal-card transition-colors"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => showToast(`Downloading ${inv.invoice_number}.pdf…`)}
                        title="Download PDF"
                        className="p-1.5 rounded-lg text-signal-text-muted hover:text-signal-text hover:bg-signal-card transition-colors"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-signal-text-muted hover:text-red-400 hover:bg-signal-card transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-signal-text-muted">
                    No invoices yet. Create your first invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-signal-surface border border-signal-border rounded-2xl shadow-signal-card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-signal-border">
              <h3 className="text-signal-text font-semibold text-lg">New Invoice</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-signal-text-muted hover:text-signal-text hover:bg-signal-card transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Project + Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-signal-text-dim text-xs mb-1.5">Project</label>
                  <select
                    value={form.projectId}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                    className={inputCls}
                  >
                    {mockProjects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-signal-text-dim text-xs mb-1.5">Issue Date</label>
                  <input
                    type="date"
                    value={form.issue_date}
                    onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-signal-text-dim text-xs mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-signal-text-dim text-xs">Line Items</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1 text-xs text-signal-green hover:opacity-80 transition-opacity"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                <div className="border border-signal-border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-signal-card border-b border-signal-border">
                        <th className="text-left px-3 py-2 text-signal-text-muted font-medium">Description</th>
                        <th className="text-center px-2 py-2 text-signal-text-muted font-medium w-16">Qty</th>
                        <th className="text-right px-2 py-2 text-signal-text-muted font-medium w-24">Unit Price</th>
                        <th className="text-right px-2 py-2 text-signal-text-muted font-medium w-24">Total</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item) => (
                        <tr key={item.id} className="border-b border-signal-border last:border-0">
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Description"
                              className="w-full bg-transparent text-signal-text placeholder:text-signal-text-muted focus:outline-none"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="number"
                              min={0}
                              step={0.5}
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full text-center bg-transparent text-signal-text focus:outline-none"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.unit_price}
                              onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-full text-right bg-transparent text-signal-text focus:outline-none"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-right text-signal-text font-medium">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-2 py-1.5">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-signal-text-muted hover:text-red-400 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tax + Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-signal-text-dim text-xs flex-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={form.tax_rate}
                      onChange={(e) => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 bg-signal-bg border border-signal-border rounded text-signal-text text-xs text-right focus:outline-none focus:border-signal-border-bright"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-signal-text-dim pt-1 border-t border-signal-border">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-signal-text-dim">
                    <span>Tax ({form.tax_rate}%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-signal-text font-bold pt-1 border-t border-signal-border">
                    <span>Total</span>
                    <span className="text-signal-green">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-signal-text-dim text-xs mb-1.5">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Payment terms, notes for client…"
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-signal-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-signal-border rounded-lg text-signal-text-dim text-sm hover:text-signal-text hover:border-signal-border-bright transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                className="px-5 py-2 bg-signal-green text-signal-bg rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-signal-surface border border-signal-border rounded-2xl shadow-signal-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-signal-border">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-signal-text-dim" />
                <h3 className="text-signal-text font-semibold">{viewInvoice.invoice_number}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[viewInvoice.status]}`}>
                  {STATUS_LABELS[viewInvoice.status]}
                </span>
              </div>
              <button
                onClick={() => setViewInvoice(null)}
                className="p-1.5 rounded-lg text-signal-text-muted hover:text-signal-text hover:bg-signal-card transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-signal-text-muted text-xs mb-0.5">Project</p>
                  <p className="text-signal-text font-medium">{viewInvoice.projectName}</p>
                </div>
                <div>
                  <p className="text-signal-text-muted text-xs mb-0.5">Currency</p>
                  <p className="text-signal-text font-medium">{viewInvoice.currency}</p>
                </div>
                <div>
                  <p className="text-signal-text-muted text-xs mb-0.5">Issue Date</p>
                  <p className="text-signal-text">{formatDate(viewInvoice.issue_date)}</p>
                </div>
                <div>
                  <p className="text-signal-text-muted text-xs mb-0.5">Due Date</p>
                  <p className="text-signal-text">{formatDate(viewInvoice.due_date)}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border border-signal-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-signal-card border-b border-signal-border">
                      <th className="text-left px-3 py-2 text-signal-text-muted font-medium">Description</th>
                      <th className="text-center px-3 py-2 text-signal-text-muted font-medium">Qty</th>
                      <th className="text-right px-3 py-2 text-signal-text-muted font-medium">Unit Price</th>
                      <th className="text-right px-3 py-2 text-signal-text-muted font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-signal-border last:border-0">
                        <td className="px-3 py-2 text-signal-text">{item.description}</td>
                        <td className="px-3 py-2 text-center text-signal-text-dim">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-signal-text-dim">
                          {formatCurrency(item.unit_price, viewInvoice.currency)}
                        </td>
                        <td className="px-3 py-2 text-right text-signal-text font-medium">
                          {formatCurrency(item.total, viewInvoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-56 space-y-1.5 text-sm">
                  <div className="flex justify-between text-signal-text-dim">
                    <span>Subtotal</span>
                    <span>{formatCurrency(viewInvoice.subtotal, viewInvoice.currency)}</span>
                  </div>
                  <div className="flex justify-between text-signal-text-dim">
                    <span>Tax ({viewInvoice.tax_rate}%)</span>
                    <span>{formatCurrency(viewInvoice.tax_amount, viewInvoice.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-signal-text border-t border-signal-border pt-1.5">
                    <span>Total</span>
                    <span className="text-signal-green">{formatCurrency(viewInvoice.total, viewInvoice.currency)}</span>
                  </div>
                </div>
              </div>

              {viewInvoice.notes && (
                <div className="p-3 bg-signal-card rounded-lg border border-signal-border text-signal-text-dim text-sm">
                  {viewInvoice.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-signal-border">
              <button
                onClick={() => showToast(`Downloading ${viewInvoice.invoice_number}.pdf…`)}
                className="flex items-center gap-2 px-4 py-2 border border-signal-border rounded-lg text-signal-text-dim text-sm hover:text-signal-text hover:border-signal-border-bright transition-colors"
              >
                <Download size={14} /> Download PDF
              </button>
              <button
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 bg-signal-surface border border-signal-border rounded-lg text-signal-text text-sm hover:border-signal-border-bright transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
