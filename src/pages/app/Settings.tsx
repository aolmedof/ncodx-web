import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, Globe, Clock, Link2, CheckCircle } from 'lucide-react';
import { getUser } from '@/lib/auth';

export function Settings() {
  const { t, i18n } = useTranslation();
  const user = getUser();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || 'Demo User',
    email: user?.email || 'demo@ncodx.com',
    language: i18n.language?.startsWith('es') ? 'es' : 'en',
    timezone: user?.timezone || 'Europe/Madrid',
    theme: 'dark',
  });
  const [connections] = useState({ google: false, outlook: false });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    i18n.changeLanguage(form.language);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Section = ({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <Icon size={17} className="text-primary-400" />
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-6">{t('settings.title')}</h2>

      <form onSubmit={handleSave} className="space-y-4">
        <Section icon={User} title={t('settings.profile')}>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {form.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{form.name}</p>
                <p className="text-slate-400 text-sm">{form.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">{t('settings.name')}</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">{t('settings.email')}</label>
                <input
                  value={form.email}
                  readOnly
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-400 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </Section>

        <Section icon={Globe} title={t('settings.preferences')}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">{t('settings.language')}</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">{t('settings.timezone')}</label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none"
              >
                <option value="Europe/Madrid">Europe/Madrid</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">{t('settings.theme')}</label>
              <div className="flex gap-2">
                {(['dark', 'light'] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setForm({ ...form, theme })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                      form.theme === theme
                        ? 'bg-primary-600 border-primary-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {theme === 'dark' ? t('settings.dark') : t('settings.light')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section icon={Link2} title={t('settings.connections')}>
          <div className="space-y-3">
            <h4 className="text-slate-400 text-sm">{t('settings.calendarConnections')}</h4>
            {[
              { key: 'google', label: 'Google Calendar', color: 'text-red-400' },
              { key: 'outlook', label: 'Microsoft Outlook', color: 'text-blue-400' },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock size={16} className={color} />
                  <div>
                    <p className="text-white text-sm font-medium">{label}</p>
                    <p className={`text-xs ${connections[key as keyof typeof connections] ? 'text-accent-400' : 'text-slate-500'}`}>
                      {connections[key as keyof typeof connections] ? t('settings.connected') : t('settings.notConnected')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    connections[key as keyof typeof connections]
                      ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50'
                      : 'bg-primary-600/20 text-primary-300 hover:bg-primary-600/30 border border-primary-700/30'
                  }`}
                >
                  {connections[key as keyof typeof connections] ? t('settings.disconnect') : t('settings.connect')}
                </button>
              </div>
            ))}
          </div>
        </Section>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition-colors"
        >
          {saved ? (
            <>
              <CheckCircle size={17} className="text-accent-300" />
              Saved!
            </>
          ) : (
            t('settings.saveChanges')
          )}
        </button>
      </form>
    </div>
  );
}
