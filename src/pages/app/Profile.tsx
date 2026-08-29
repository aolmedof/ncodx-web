import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  Button, Card, CardBody, CardHeader, ErrorState, Field, Input, PageHeader,
  PageShell, Skeleton,
} from '@/components/ui';
import { useMe, useUpdateMe } from '@/hooks/queries';
import type { User } from '@/types';

function toForm(user: User) {
  return {
    fullName: user.full_name ?? user.name ?? '',
    company: user.company ?? '',
    taxId: user.tax_id ?? '',
    phone: user.phone ?? '',
    address: user.address ?? '',
    city: user.city ?? '',
    state: user.state ?? '',
    country: user.country ?? '',
    zipCode: user.zip_code ?? '',
    bankName: user.bank_name ?? '',
    bankAccount: user.bank_account ?? '',
    bankRouting: user.bank_routing ?? '',
    paymentMethod: user.payment_method ?? '',
    paypalEmail: user.paypal_email ?? '',
  };
}

/** Mounted only once the user has loaded, so the form seeds itself from props
 *  rather than syncing through an effect. */
function ProfileForm({ user }: { user: User }) {
  const updateMe = useUpdateMe();
  const [form, setForm] = useState(() => toForm(user));
  const [saved, setSaved] = useState(false);

  const set = (key: keyof ReturnType<typeof toForm>) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateMe.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="These details appear on the invoices you issue."
        actions={
          <Button variant="primary" type="submit" form="profile-form" loading={updateMe.isPending}>
            {saved ? <><Check size={15} />Saved</> : 'Save changes'}
          </Button>
        }
      />

      <form id="profile-form" onSubmit={handleSave} className="mt-5 space-y-3">
        <Card>
          <CardHeader title="Identity" />
          <CardBody className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-lg font-semibold text-brand">
                {(user.name ?? '?').charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-medium text-ink">{user.name}</p>
                <p className="text-[13px] text-ink-faint">{user.email}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="p-name">
                <Input id="p-name" value={form.fullName} onChange={set('fullName')} />
              </Field>
              <Field label="Phone" htmlFor="p-phone">
                <Input id="p-phone" value={form.phone} onChange={set('phone')} />
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Company" description="Used as the issuer block on invoices." />
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company" htmlFor="p-company">
                <Input id="p-company" value={form.company} onChange={set('company')} />
              </Field>
              <Field label="Tax ID" htmlFor="p-tax">
                <Input id="p-tax" className="font-mono" value={form.taxId} onChange={set('taxId')} />
              </Field>
            </div>
            <Field label="Address" htmlFor="p-address">
              <Input id="p-address" value={form.address} onChange={set('address')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="City" htmlFor="p-city"><Input id="p-city" value={form.city} onChange={set('city')} /></Field>
              <Field label="State" htmlFor="p-state"><Input id="p-state" value={form.state} onChange={set('state')} /></Field>
              <Field label="Country" htmlFor="p-country"><Input id="p-country" value={form.country} onChange={set('country')} /></Field>
              <Field label="Postcode" htmlFor="p-zip"><Input id="p-zip" value={form.zipCode} onChange={set('zipCode')} /></Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Payment details" description="Where clients send payment." />
          <CardBody className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Bank name" htmlFor="p-bank">
                <Input id="p-bank" value={form.bankName} onChange={set('bankName')} />
              </Field>
              <Field label="Payment method" htmlFor="p-method">
                <Input id="p-method" placeholder="Wire transfer" value={form.paymentMethod} onChange={set('paymentMethod')} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Account number" htmlFor="p-account">
                <Input id="p-account" className="font-mono" value={form.bankAccount} onChange={set('bankAccount')} />
              </Field>
              <Field label="Routing / SWIFT" htmlFor="p-routing">
                <Input id="p-routing" className="font-mono" value={form.bankRouting} onChange={set('bankRouting')} />
              </Field>
            </div>
            <Field label="PayPal email" htmlFor="p-paypal">
              <Input id="p-paypal" type="email" value={form.paypalEmail} onChange={set('paypalEmail')} />
            </Field>
          </CardBody>
        </Card>
      </form>
    </>
  );
}

export function Profile() {
  const { data: user, isPending, isError, error, refetch } = useMe();

  return (
    <PageShell>
      {isError ? (
        <>
          <PageHeader title="Profile" />
          <Card className="mt-5">
            <ErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
          </Card>
        </>
      ) : isPending || !user ? (
        <>
          <Skeleton className="h-8 w-40" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-56" />)}
          </div>
        </>
      ) : (
        <ProfileForm user={user} />
      )}
    </PageShell>
  );
}
