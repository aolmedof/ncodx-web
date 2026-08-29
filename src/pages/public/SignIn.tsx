import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button, Field, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-full bg-brand" />
          <span className="text-base font-semibold tracking-tight text-ink">NCODX</span>
        </Link>

        <div className="rounded-xl border border-line bg-surface p-6 shadow-panel">
          <h1 className="text-lg">Sign in</h1>
          <p className="mt-1 text-[13px] text-ink-dim">
            Access your projects, timesheets and invoices.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </Field>

            <Field label="Password" htmlFor="password" required>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-ink-faint transition-colors hover:text-ink"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            {error && (
              <p role="alert" className="rounded-md border border-critical/25 bg-critical-soft px-3 py-2 text-[13px] text-critical">
                {error}
              </p>
            )}

            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={busy}
              className="w-full"
              disabled={!email.trim() || !password}
            >
              Sign in
              {!busy && <ArrowRight size={15} />}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-[13px] text-ink-faint">
          <Link to="/" className="hover:text-ink-dim">← Back to ncodx.com</Link>
        </p>
      </div>
    </div>
  );
}
