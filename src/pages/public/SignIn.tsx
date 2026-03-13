import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Terminal, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function SignIn() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerToast, setRegisterToast] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/app');
    } catch {
      setError(t('auth.error', 'Credenciales inválidas. Verifica tu email y contraseña.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterOpen(false);
    setRegisterToast(true);
    setTimeout(() => setRegisterToast(false), 5000);
  };

  return (
    <div className="min-h-screen bg-signal-bg font-mono flex">
      <div className="hidden lg:flex lg:w-1/2 bg-signal-surface border-r border-signal-border relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.1) 2px, rgba(0,255,65,0.1) 4px)' }} />
        <div className="flex items-center gap-3 relative z-10">
          <Terminal size={20} className="text-signal-green" />
          <span className="text-signal-green font-bold text-xl tracking-widest">NCODX</span>
        </div>
        <div className="relative z-10">
          <div className="text-signal-text-muted text-xs mb-2 tracking-widest">// PROJECT MANAGEMENT PLATFORM</div>
          <h2 className="text-4xl font-bold text-signal-text leading-tight mb-4">
            Your complete<br />
            <span className="text-signal-green">dev workspace.</span>
          </h2>
          <p className="text-signal-text-dim text-sm leading-relaxed max-w-sm">
            Manage cloud projects, track time, generate invoices, and collaborate — all in one terminal-inspired platform.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap relative z-10">
          {['Cloud', 'DevOps', 'AI', 'Security', 'Infra'].map((tag) => (
            <span key={tag} className="px-2 py-1 bg-signal-card border border-signal-border text-signal-text-dim text-xs rounded">{tag}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-signal-bg">
        <div className="flex items-center justify-between px-6 pt-6">
          <Link to="/" className="text-signal-text-dim hover:text-signal-green transition-colors text-xs flex items-center gap-2">
            ← {t('auth.backHome', 'Volver al inicio')}
          </Link>
          <button onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
            className="text-xs text-signal-text-muted hover:text-signal-green transition-colors uppercase tracking-widest">
            {i18n.language === 'es' ? 'EN' : 'ES'}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <Terminal size={18} className="text-signal-green" />
              <span className="text-signal-green font-bold text-lg tracking-widest">NCODX</span>
            </div>
            <div className="mb-8">
              <div className="text-signal-text-muted text-xs tracking-widest mb-1">// ACCESO AL SISTEMA</div>
              <h1 className="text-2xl font-bold text-signal-text">{t('auth.signIn', 'Iniciar Sesión')}</h1>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-950/50 border border-red-800/50 rounded text-red-400 text-xs mb-6">
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 tracking-wider uppercase">{t('auth.email', 'Email')}</label>
                <input type="email" required placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-signal-card border border-signal-border text-signal-text placeholder-signal-text-muted text-sm rounded focus:outline-none focus:border-signal-green focus:ring-1 focus:ring-signal-green/30 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 tracking-wider uppercase">{t('auth.password', 'Contraseña')}</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-signal-card border border-signal-border text-signal-text placeholder-signal-text-muted text-sm rounded focus:outline-none focus:border-signal-green focus:ring-1 focus:ring-signal-green/30 transition-colors pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-signal-text-muted hover:text-signal-text-dim transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-signal-green hover:bg-signal-green-dim disabled:opacity-50 text-signal-bg font-bold text-sm rounded transition-colors mt-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-signal-bg/30 border-t-signal-bg rounded-full animate-spin" /> {t('auth.submitting', 'Autenticando...')}</>
                ) : t('auth.submit', 'Iniciar Sesión')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => setRegisterOpen(true)}
                className="text-xs text-signal-text-muted hover:text-signal-green transition-colors">
                {t('auth.noAccount', '¿No tienes cuenta?')}{' '}
                <span className="text-signal-text-dim underline">{t('auth.register', 'Registrarse')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {registerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-signal-card border border-signal-border rounded w-full max-w-md mx-4 p-6 shadow-signal-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-signal-text-muted text-xs tracking-widest mb-0.5">// NUEVO ACCESO</div>
                <h2 className="text-lg font-bold text-signal-text">{t('auth.registerTitle', 'Crear Cuenta')}</h2>
              </div>
              <button onClick={() => setRegisterOpen(false)} className="text-signal-text-muted hover:text-signal-text transition-colors"><X size={16} /></button>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 tracking-wider uppercase">{t('auth.name', 'Nombre')}</label>
                <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Tu nombre completo"
                  className="w-full px-3 py-2.5 bg-signal-surface border border-signal-border text-signal-text placeholder-signal-text-muted text-sm rounded focus:outline-none focus:border-signal-green transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 tracking-wider uppercase">{t('auth.email', 'Email')}</label>
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="tu@email.com"
                  className="w-full px-3 py-2.5 bg-signal-surface border border-signal-border text-signal-text placeholder-signal-text-muted text-sm rounded focus:outline-none focus:border-signal-green transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 tracking-wider uppercase">{t('auth.password', 'Contraseña')}</label>
                <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-signal-surface border border-signal-border text-signal-text placeholder-signal-text-muted text-sm rounded focus:outline-none focus:border-signal-green transition-colors" />
              </div>
              <button type="submit" className="w-full px-4 py-2.5 bg-signal-green hover:bg-signal-green-dim text-signal-bg font-bold text-sm rounded transition-colors">
                {t('auth.register', 'Registrarse')}
              </button>
            </form>
          </div>
        </div>
      )}

      {registerToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-signal-card border border-signal-border rounded px-4 py-3 flex items-start gap-3 shadow-signal-card max-w-sm">
          <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-signal-text">{t('auth.registerDisabledTitle', 'Registro deshabilitado')}</div>
            <div className="text-xs text-signal-text-dim mt-0.5">{t('auth.registerDisabled', 'El registro está temporalmente deshabilitado. Contacta al administrador.')}</div>
          </div>
          <button onClick={() => setRegisterToast(false)} className="text-signal-text-muted hover:text-signal-text ml-2 flex-shrink-0"><X size={13} /></button>
        </div>
      )}
    </div>
  );
}
