import { useMemo, useState } from 'react';
import { Copy, Eye, EyeOff, KeyRound, Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge, Button, Card, CardBody, EmptyState, ErrorState, Field, Input, Modal,
  PageHeader, PageShell, SearchInput, Skeleton,
} from '@/components/ui';
import { api } from '@/lib/api';
import { secretsResource, useSecrets } from '@/hooks/queries';
import { formatDate } from '@/lib/format';
import type { Secret } from '@/types';

/** The list route redacts `value`; it is fetched per-secret only when revealed. */
function RevealCell({ id }: { id: string }) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data, isFetching } = useQuery({
    queryKey: ['secrets', 'detail', id],
    queryFn: () => api.get<Secret>(`/secrets/${id}`),
    enabled: shown,
    staleTime: 0,
    gcTime: 0,
  });

  async function copy() {
    if (!data?.value) return;
    await navigator.clipboard.writeText(data.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-1.5">
      <code className="min-w-0 flex-1 truncate rounded bg-canvas px-2 py-1 font-mono text-[12px] text-ink-dim">
        {shown ? (isFetching ? 'Loading…' : data?.value ?? '—') : '••••••••••••'}
      </code>
      <Button size="sm" variant="ghost" iconOnly onClick={() => setShown((v) => !v)}
        aria-label={shown ? 'Hide value' : 'Reveal value'}>
        {shown ? <EyeOff size={13} /> : <Eye size={13} />}
      </Button>
      {shown && data?.value && (
        <Button size="sm" variant="ghost" iconOnly onClick={copy} aria-label="Copy value"
          className={copied ? 'text-brand' : undefined}>
          <Copy size={13} />
        </Button>
      )}
    </div>
  );
}

export function Secrets() {
  const { data, isPending, isError, error, refetch } = useSecrets();
  const createSecret = secretsResource.useCreate();
  const removeSecret = secretsResource.useRemove();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', value: '', category: 'api_key' });

  const secrets = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data ?? [])
      .filter((s) => !term || s.name.toLowerCase().includes(term))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, query]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.value) return;
    await createSecret.mutateAsync({ name: form.name.trim(), value: form.value, category: form.category });
    setOpen(false);
    setForm({ name: '', value: '', category: 'api_key' });
  }

  return (
    <PageShell>
      <PageHeader
        title="Secrets"
        description="Encrypted at rest. Values are only fetched when you reveal them."
        actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus size={15} />New secret</Button>}
      />

      <div className="mt-5">
        <div className="w-full sm:w-72">
          <SearchInput value={query} onChange={setQuery} placeholder="Search secrets…" />
        </div>
      </div>

      <Card className="mt-4 overflow-hidden">
        {isPending ? (
          <CardBody className="space-y-2">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-11" />)}
          </CardBody>
        ) : isError ? (
          <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
        ) : secrets.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title={data?.length ? 'No secrets match' : 'No secrets stored'}
            description={data?.length ? 'Try a different search.' : 'Store API keys and tokens so they stay out of your repos.'}
            action={<Button size="sm" variant="primary" onClick={() => setOpen(true)}><Plus size={14} />New secret</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[12px] text-ink-faint">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                  <th className="w-72 px-4 py-2.5 font-medium">Value</th>
                  <th className="px-4 py-2.5 font-medium">Updated</th>
                  <th className="w-10 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {secrets.map((secret) => (
                  <tr key={secret.id} className="group transition-colors hover:bg-raised/50">
                    <td className="px-4 py-2.5 font-mono text-ink">{secret.name}</td>
                    <td className="px-4 py-2.5"><Badge tone="neutral">{secret.category}</Badge></td>
                    <td className="px-4 py-2.5"><RevealCell id={secret.id} /></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-faint">{formatDate(secret.updatedAt)}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => removeSecret.mutate(secret.id)}
                        aria-label={`Delete ${secret.name}`}
                        className="rounded p-1 text-ink-faint opacity-0 transition hover:bg-critical-soft hover:text-critical group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New secret"
        description="The value is encrypted before it is stored."
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="secret-form"
              loading={createSecret.isPending} disabled={!form.name.trim() || !form.value}>
              Store secret
            </Button>
          </>
        }
      >
        <form id="secret-form" onSubmit={handleCreate} className="space-y-4">
          <Field label="Name" required htmlFor="s-name" hint="Use the environment-variable name.">
            <Input id="s-name" autoFocus className="font-mono" placeholder="GITHUB_TOKEN"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Value" required htmlFor="s-value">
            <Input id="s-value" type="password" autoComplete="new-password" className="font-mono"
              value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          </Field>
          <Field label="Category" htmlFor="s-cat">
            <Input id="s-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </Field>
        </form>
      </Modal>
    </PageShell>
  );
}
