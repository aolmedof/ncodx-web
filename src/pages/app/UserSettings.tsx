import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Bell, Shield, Code, Globe, CheckCircle, Copy, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SECTION_CLASS = "bg-signal-card border border-signal-border rounded p-5 mb-6";
const LABEL_CLASS = "block text-xs text-signal-text-dim mb-1.5 uppercase tracking-wider";
const FIELD_CLASS = "w-full px-3 py-2 bg-signal-surface border border-signal-border text-signal-text placeholder-signal-text-muted text-sm rounded focus:outline-none focus:border-signal-green transition-colors font-mono";
const TOGGLE_CLASS = "relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className={`${TOGGLE_CLASS} ${enabled ? 'bg-signal-green' : 'bg-signal-surface border border-signal-border'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

const TIMEZONES = [
  'America/Mexico_City', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
  'Europe/Madrid', 'Europe/London', 'Europe/Paris', 'Europe/Moscow',
  'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney', 'UTC',
];

export function UserSettings() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [timezone, setTimezone] = useState(user?.timezone || 'America/Mexico_City');
  const [notifications, setNotifications] = useState({ email: true, browser: false, digest: true });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [apiToken] = useState('ncodx_pat_' + Math.random().toString(36).slice(2, 18));
  const [tokenCopied, setTokenCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const copyToken = () => {
    navigator.clipboard.writeText(apiToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const handlePwSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) return;
    setPwSaved(true);
    setPasswords({ current: '', next: '', confirm: '' });
    setTimeout(() => setPwSaved(false), 2500);
  };

  return (
    <div className="p-6 bg-signal-bg min-h-full font-mono max-w-3xl">
      <div className="mb-8">
        <div className="text-signal-text-muted text-xs tracking-widest mb-1">// CONFIGURACIÓN</div>
        <h1 className="text-xl font-bold text-signal-text flex items-center gap-2">
          <Settings size={18} className="text-signal-green" />
          {t('app.settings', 'Configuración')}
        </h1>
      </div>

      {/* Appearance / Language */}
      <div className={SECTION_CLASS}>
        <div className="text-xs text-signal-text-muted tracking-widest mb-4 flex items-center gap-2"><Globe size={13} /> // IDIOMA Y REGIÓN</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>{t('settings.language', 'Idioma')}</label>
            <select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)} className={FIELD_CLASS}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>{t('settings.timezone', 'Zona Horaria')}</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={FIELD_CLASS}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleSave}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-signal-green hover:bg-signal-green-dim text-signal-bg font-bold text-xs rounded transition-colors">
          {saved ? <><CheckCircle size={13} /> {t('app.saved', 'Guardado')}</> : t('app.save', 'Guardar')}
        </button>
      </div>

      {/* Notifications */}
      <div className={SECTION_CLASS}>
        <div className="text-xs text-signal-text-muted tracking-widest mb-4 flex items-center gap-2"><Bell size={13} /> // NOTIFICACIONES</div>
        <div className="space-y-3">
          {[
            { key: 'email', label: t('settings.emailNotifs', 'Notificaciones por email'), desc: t('settings.emailNotifDesc', 'Recibe alertas de tareas y proyectos') },
            { key: 'browser', label: t('settings.browserNotifs', 'Notificaciones del navegador'), desc: t('settings.browserNotifDesc', 'Notificaciones push en tiempo real') },
            { key: 'digest', label: t('settings.weeklyDigest', 'Resumen semanal'), desc: t('settings.weeklyDigestDesc', 'Email resumen cada lunes') },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-signal-text">{label}</div>
                <div className="text-xs text-signal-text-muted">{desc}</div>
              </div>
              <Toggle enabled={notifications[key as keyof typeof notifications]} onChange={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className={SECTION_CLASS}>
        <div className="text-xs text-signal-text-muted tracking-widest mb-4 flex items-center gap-2"><Shield size={13} /> // SEGURIDAD</div>
        <form onSubmit={handlePwSave} className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>{t('settings.currentPassword', 'Contraseña actual')}</label>
            <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="••••••••" className={FIELD_CLASS} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>{t('settings.newPassword', 'Nueva contraseña')}</label>
              <input type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} placeholder="••••••••" className={FIELD_CLASS} required />
            </div>
            <div>
              <label className={LABEL_CLASS}>{t('settings.confirmPassword', 'Confirmar contraseña')}</label>
              <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="••••••••" className={FIELD_CLASS} required />
            </div>
          </div>
          {passwords.next && passwords.confirm && passwords.next !== passwords.confirm && (
            <div className="text-xs text-red-400">Las contraseñas no coinciden</div>
          )}
          <div className="flex items-center gap-3">
            <button type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-signal-green hover:bg-signal-green-dim text-signal-bg font-bold text-xs rounded transition-colors">
              {pwSaved ? <><CheckCircle size={13} /> {t('settings.passwordChanged', 'Contraseña actualizada')}</> : t('settings.changePassword', 'Cambiar contraseña')}
            </button>
            <button type="button" className="px-4 py-2 bg-red-950/50 hover:bg-red-900/50 border border-red-800/50 text-red-400 text-xs rounded transition-colors">
              {t('settings.revokeSessions', 'Revocar todas las sesiones')}
            </button>
          </div>
        </form>
      </div>

      {/* Integrations */}
      <div className={SECTION_CLASS}>
        <div className="text-xs text-signal-text-muted tracking-widest mb-4">// INTEGRACIONES DE CALENDARIO</div>
        <div className="space-y-3">
          {[
            { name: 'Google Calendar', connected: false, color: 'text-green-400' },
            { name: 'Outlook Calendar', connected: false, color: 'text-blue-400' },
          ].map(({ name, connected, color }) => (
            <div key={name} className="flex items-center justify-between p-3 bg-signal-surface border border-signal-border rounded">
              <div>
                <div className={`text-sm font-semibold ${color}`}>{name}</div>
                <div className="text-xs text-signal-text-muted">{connected ? t('settings.connected', 'Conectado') : t('settings.notConnected', 'No conectado')}</div>
              </div>
              <button className={`text-xs px-3 py-1.5 rounded border transition-colors ${connected ? 'border-red-800/50 text-red-400 hover:bg-red-950/50' : 'border-signal-border text-signal-text-dim hover:border-signal-green hover:text-signal-green'}`}>
                {connected ? t('settings.disconnect', 'Desconectar') : t('settings.connect', 'Conectar')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Developer */}
      <div className={SECTION_CLASS}>
        <div className="text-xs text-signal-text-muted tracking-widest mb-4 flex items-center gap-2"><Code size={13} /> // API / DEVELOPER</div>
        <div>
          <label className={LABEL_CLASS}>{t('settings.apiToken', 'API Token personal')}</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-signal-surface border border-signal-border text-signal-text-muted text-sm rounded font-mono truncate">
              {apiToken.slice(0, 12)}{'•'.repeat(16)}
            </div>
            <button onClick={copyToken} title="Copy"
              className="p-2 bg-signal-surface border border-signal-border text-signal-text-dim hover:text-signal-green rounded transition-colors">
              {tokenCopied ? <CheckCircle size={15} className="text-signal-green" /> : <Copy size={15} />}
            </button>
            <button title="Regenerate"
              className="p-2 bg-signal-surface border border-signal-border text-signal-text-dim hover:text-yellow-400 rounded transition-colors">
              <RefreshCw size={15} />
            </button>
          </div>
          <div className="mt-2 text-xs text-signal-text-muted">{t('settings.tokenWarning', 'Mantén tu token seguro. No lo compartas ni lo subas a repositorios.')}</div>
        </div>
      </div>
    </div>
  );
}
