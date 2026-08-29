import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Button, Card, CardBody, CardHeader, Field, PageHeader, PageShell, Select, Skeleton,
} from '@/components/ui';
import { useMe, useUpdateMe } from '@/hooks/queries';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

const TIMEZONES = [
  'UTC', 'Europe/Madrid', 'Europe/London', 'Europe/Kyiv',
  'America/Mexico_City', 'America/New_York', 'America/Los_Angeles',
];

function SettingsForm({ user }: { user: User }) {
  const updateMe = useUpdateMe();
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState(() => user.language ?? 'es');
  const [timezone, setTimezone] = useState(() => user.timezone ?? 'UTC');
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateMe.mutateAsync({ locale, timezone });
    i18n.changeLanguage(locale);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Language, timezone and session."
        actions={
          <Button variant="primary" type="submit" form="settings-form" loading={updateMe.isPending}>
            {saved ? <><Check size={15} />Saved</> : 'Save changes'}
          </Button>
        }
      />
      <form id="settings-form" onSubmit={handleSave} className="mt-5">
        <Card>
          <CardHeader title="Preferences" />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Language" htmlFor="s-locale">
                <Select id="s-locale" value={locale} onChange={(e) => setLocale(e.target.value as 'es' | 'en')}>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </Select>
              </Field>
              <Field label="Timezone" htmlFor="s-tz">
                <Select id="s-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </Select>
              </Field>
            </div>
          </CardBody>
        </Card>
      </form>
    </>
  );
}

export function UserSettings() {
  const { data: user, isPending } = useMe();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <PageShell>
      {isPending || !user ? (
        <>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-5 h-48" />
        </>
      ) : (
        <SettingsForm user={user} />
      )}

      <Card className="mt-3">
        <CardHeader title="Account" description={user?.email} />
        <CardBody>
          <Button onClick={() => { signOut(); navigate('/signin'); }}>
            <LogOut size={15} />Sign out
          </Button>
        </CardBody>
      </Card>
    </PageShell>
  );
}
