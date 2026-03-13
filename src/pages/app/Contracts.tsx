import { useState } from 'react';
import { Plus, X, Pencil, Trash2, CheckCircle, TrendingUp, FileText, DollarSign } from 'lucide-react';
import { mockContracts, mockProjects } from '@/lib/mock-data';
import type { Contract, ContractStatus, ContractType } from '@/types';

// ─── Styles ───────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<ContractStatus, string> = {
  active: 'bg-signal-green/20 text-signal-green border border-signal-green/30',
  paused: 'bg-amber-900/30 text-amber-300 border border-amber-700/40',
  completed: 'bg-blue-900/30 text-blue-300 border border-blue-700/40',
  cancelled: 'bg-slate-700/40 text-slate-400 border border-slate-600/40',
};

const TYPE_STYLES: Record<ContractType, string> = {
  hourly: 'bg-violet-900/30 text-violet-300 border border-violet-700/40',
  monthly: 'bg-blue-900/30 text-blue-300 border border-blue-700/40',
  fixed: 'bg-amber-900/30 text-amber-300 border border-amber-700/40',
  retainer: 'bg-teal-900/30 text-teal-300 border border-teal-700/40',
};

const TYPE_LABELS: Record<ContractType, string> = {
  hourly: 'Hourly',
  monthly: 'Monthly',
  fixed: 'Fixed',
  retainer: 'Retainer',
};

// ─── Form state ────────────────────────────────────────────────────────────────
interface ContractFormState {
  projectId: string;
  title: string;
  type: ContractType;
  rate: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  notes: string;
}

const emptyForm = (): ContractFormState => ({
  projectId: mockProjects[0]?.id ?? '',
  title: '',
  type: 'hourly',
  rate: 0,
  currency: 'USD',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  status: 'active',
  notes: '',
});

function contractFromForm(form: ContractFormState, existing?: Contract): Contract {
  const project = mockProjects.find((p) => p.id === form.projectId);
  const now = new Date().toISOString();
  return {
    id: existing?.id ?? `ct_${Date.now()}`,
    projectId: form.projectId,
    projectName: project?.name ?? '',
    title: form.title,
    type: form.type,
    rate: form.rate,
    currency: form.currency,
    startDate: form.startDate,
    endDate: form.endDate || undefined,
    status: form.status,
    notes: form.notes || undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function formFromContract(c: Contract): ContractFormState {
  return {
    projectId: c.projectId,
    title: c.title,
    type: c.type,
    rate: c.rate,
    currency: c.currency,
    startDate: c.startDate,
    endDate: c.endDate ?? '',
    status: c.status,
    notes: c.notes ?? '',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<ContractFormState>(emptyForm());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setEditingContract(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (c: Contract) => {
    setEditingContract(c);
    setForm(formFromContract(c));
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingContract) {
      setContracts((prev) =>
        prev.map((c) => (c.id === editingContract.id ? contractFromForm(form, editingContract) : c))
      );
      showToast('Contract updated');
    } else {
      setContracts((prev) => [contractFromForm(form), ...prev]);
      showToast('Contract created');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
    showToast('Contract deleted');
  };

  // ─── Summary stats ──────────────────────────────────────────────────────────
  const activeContracts = contracts.filter((c) => c.status === 'active');
  const monthlyRevenue = activeContracts
    .filter((c) => c.type === 'monthly' || c.type === 'retainer')
    .reduce((s, c) => s + c.rate, 0);
  const totalContractValue = contracts.reduce((s, c) => s + c.rate, 0);

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
          <h2 className="text-xl font-bold text-signal-text">Contracts</h2>
          <p className="text-signal-text-muted text-sm mt-0.5">{contracts.length} contracts total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-signal-green text-signal-bg rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          New Contract
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-signal-surface border border-signal-border rounded-xl p-4 shadow-signal-card">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={15} className="text-signal-green" />
            <p className="text-signal-text-muted text-xs">Active Contracts</p>
          </div>
          <p className="text-2xl font-bold text-signal-green">{activeContracts.length}</p>
        </div>
        <div className="bg-signal-surface border border-signal-border rounded-xl p-4 shadow-signal-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} className="text-blue-400" />
            <p className="text-signal-text-muted text-xs">Monthly Revenue</p>
          </div>
          <p className="text-2xl font-bold text-signal-text">
            ${monthlyRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-signal-surface border border-signal-border rounded-xl p-4 shadow-signal-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={15} className="text-amber-400" />
            <p className="text-signal-text-muted text-xs">Total Contract Value</p>
          </div>
          <p className="text-2xl font-bold text-signal-text">
            ${totalContractValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-signal-surface border border-signal-border rounded-xl overflow-hidden shadow-signal-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-signal-border">
                {['Project', 'Title', 'Type', 'Rate', 'Period', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-signal-text-muted font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const project = mockProjects.find((p) => p.id === c.projectId);
                return (
                  <tr
                    key={c.id}
                    className="border-b border-signal-border hover:bg-signal-card/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project?.color ?? '#888' }}
                        />
                        <span className="text-signal-text">{c.projectName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-signal-text">{c.title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[c.type]}`}>
                        {TYPE_LABELS[c.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-signal-text font-semibold">
                      {c.rate > 0 ? `${c.currency} ${c.rate.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-signal-text-dim text-xs">
                      <span>{c.startDate}</span>
                      {c.endDate && <><br /><span>→ {c.endDate}</span></>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[c.status]}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg text-signal-text-muted hover:text-signal-text hover:bg-signal-card transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(c.id)}
                          className="p-1.5 rounded-lg text-signal-text-muted hover:text-red-400 hover:bg-signal-card transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-signal-text-muted">
                    No contracts yet. Create your first contract.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-signal-surface border border-signal-border rounded-2xl shadow-signal-card p-6 max-w-sm w-full">
            <h3 className="text-signal-text font-semibold mb-2">Delete Contract</h3>
            <p className="text-signal-text-dim text-sm mb-5">
              Are you sure you want to delete this contract? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-signal-border rounded-lg text-signal-text-dim text-sm hover:border-signal-border-bright transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-signal-surface border border-signal-border rounded-2xl shadow-signal-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-signal-border">
              <h3 className="text-signal-text font-semibold text-lg">
                {editingContract ? 'Edit Contract' : 'New Contract'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-signal-text-muted hover:text-signal-text hover:bg-signal-card transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Project */}
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

              {/* Title */}
              <div>
                <label className="block text-signal-text-dim text-xs mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contract title"
                  className={inputCls}
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-signal-text-dim text-xs mb-2">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['hourly', 'monthly', 'fixed', 'retainer'] as ContractType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                        form.type === t
                          ? TYPE_STYLES[t]
                          : 'border-signal-border text-signal-text-muted hover:border-signal-border-bright'
                      }`}
                    >
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate + Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-signal-text-dim text-xs mb-1.5">Rate</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.rate}
                    onChange={(e) => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-signal-text-dim text-xs mb-1.5">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className={inputCls}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="MXN">MXN</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-signal-text-dim text-xs mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-signal-text-dim text-xs mb-1.5">End Date (optional)</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-signal-text-dim text-xs mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ContractStatus })}
                  className={inputCls}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-signal-text-dim text-xs mb-1.5">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Scope, terms, or special conditions…"
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
                onClick={handleSave}
                disabled={!form.title.trim()}
                className="px-5 py-2 bg-signal-green text-signal-bg rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {editingContract ? 'Save Changes' : 'Create Contract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
