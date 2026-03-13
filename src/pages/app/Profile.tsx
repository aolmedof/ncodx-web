import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Save, CheckCircle, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { saveUser } from '@/lib/auth';
import type { User as UserType } from '@/types';

const FIELD_CLASS = "w-full px-3 py-2 bg-signal-card border border-signal-border text-signal-text placeholder-signal-text-muted text-sm rounded focus:outline-none focus:border-signal-green transition-colors font-mono";
const LABEL_CLASS = "block text-xs text-signal-text-dim mb-1.5 uppercase tracking-wider";
const READONLY_CLASS = "w-full px-3 py-2 bg-signal-surface border border-signal-border text-signal-text-dim text-sm rounded font-mono cursor-not-allowed";

export function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState<Partial<UserType>>(user ?? {});
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const set = (key: keyof UserType, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setAvatarPreview(b64);
      setForm((prev) => ({ ...prev, avatar: b64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...user, ...form } as UserType;
    saveUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = (user.name || user.email).charAt(0).toUpperCase();

  return (
    <div className="p-6 bg-signal-bg min-h-full font-mono max-w-4xl">
      <div className="mb-8">
        <div className="text-signal-text-muted text-xs tracking-widest mb-1">// PERFIL DE USUARIO</div>
        <h1 className="text-xl font-bold text-signal-text flex items-center gap-2">
          <User size={18} className="text-signal-green" />
          {t('app.profile', 'Mi Perfil')}
        </h1>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar column */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-28 h-28 rounded-full object-cover border-2 border-signal-border" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-signal-card border-2 border-signal-border flex items-center justify-center text-3xl font-bold text-signal-green">
                  {initials}
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-signal-green rounded-full flex items-center justify-center hover:bg-signal-green-dim transition-colors">
                <Camera size={14} className="text-signal-bg" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-signal-text">{user.name}</div>
              <div className="text-xs text-signal-text-muted">{user.email}</div>
              <div className="mt-1 px-2 py-0.5 bg-signal-green/10 border border-signal-green/30 text-signal-green text-xs rounded inline-block">{user.role}</div>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-signal-card border border-signal-border rounded p-5">
              <div className="text-xs text-signal-text-muted tracking-widest mb-4">// INFORMACIÓN PERSONAL</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>{t('profile.fullName', 'Nombre Completo')}</label>
                  <input value={form.full_name ?? ''} onChange={(e) => set('full_name', e.target.value)} placeholder="Nombre completo" className={FIELD_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>{t('profile.name', 'Nombre corto / Username')}</label>
                  <input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="Username" className={FIELD_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>{t('auth.email', 'Email')}</label>
                  <input type="email" value={user.email} readOnly className={READONLY_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>{t('profile.phone', 'Teléfono')}</label>
                  <input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="+52 55 1234 5678" className={FIELD_CLASS} />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS}>{t('profile.company', 'Empresa')}</label>
                  <input value={form.company ?? ''} onChange={(e) => set('company', e.target.value)} placeholder="Nombre de la empresa" className={FIELD_CLASS} />
                </div>
              </div>
            </div>

            {/* Tax/Legal */}
            <div className="bg-signal-card border border-signal-border rounded p-5">
              <div className="text-xs text-signal-text-muted tracking-widest mb-4">// DATOS FISCALES / LEGALES</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>{t('profile.taxId', 'RFC / Tax ID')}</label>
                  <input value={form.tax_id ?? ''} onChange={(e) => set('tax_id', e.target.value)} placeholder="XXXXXXXXXXXXX" className={FIELD_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>{t('profile.country', 'País')}</label>
                  <input value={form.country ?? ''} onChange={(e) => set('country', e.target.value)} placeholder="México" className={FIELD_CLASS} />
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS}>{t('profile.address', 'Dirección')}</label>
                  <input value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} placeholder="Calle y número" className={FIELD_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>{t('profile.city', 'Ciudad')}</label>
                  <input value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} placeholder="Ciudad de México" className={FIELD_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>{t('profile.state', 'Estado')}</label>
                  <input value={form.state ?? ''} onChange={(e) => set('state', e.target.value)} placeholder="CDMX" className={FIELD_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>{t('profile.zip', 'Código Postal')}</label>
                  <input value={form.zip_code ?? ''} onChange={(e) => set('zip_code', e.target.value)} placeholder="06600" className={FIELD_CLASS} />
                </div>
              </div>
            </div>

            {/* Banking */}
            <div className="bg-signal-card border border-signal-border rounded p-5">
              <div className="text-xs text-signal-text-muted tracking-widest mb-4">// DATOS BANCARIOS / PAGO</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_CLASS}>{t('profile.bankName', 'Banco')}</label>
                  <input value={form.bank_name ?? ''} onChange={(e) => set('bank_name', e.target.value)} placeholder="BBVA, Santander..." className={FIELD_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>{t('profile.bankAccount', 'Cuenta / CLABE')}</label>
                  <input value={form.bank_account ?? ''} onChange={(e) => set('bank_account', e.target.value)} placeholder="18 dígitos" className={FIELD_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>{t('profile.bankRouting', 'Routing / SWIFT')}</label>
                  <input value={form.bank_routing ?? ''} onChange={(e) => set('bank_routing', e.target.value)} placeholder="BBBVMXMM..." className={FIELD_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>{t('profile.paymentMethod', 'Método de pago preferido')}</label>
                  <select value={form.payment_method ?? 'bank_transfer'} onChange={(e) => set('payment_method', e.target.value)}
                    className={FIELD_CLASS}>
                    <option value="bank_transfer">Transferencia bancaria</option>
                    <option value="paypal">PayPal</option>
                    <option value="crypto">Crypto</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS}>{t('profile.paypalEmail', 'Email PayPal')}</label>
                  <input type="email" value={form.paypal_email ?? ''} onChange={(e) => set('paypal_email', e.target.value)} placeholder="tu@paypal.com" className={FIELD_CLASS} />
                </div>
              </div>
            </div>

            <button type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-signal-green hover:bg-signal-green-dim text-signal-bg font-bold text-sm rounded transition-colors">
              {saved ? <><CheckCircle size={15} /> {t('app.saved', 'Guardado')}</> : <><Save size={15} /> {t('app.save', 'Guardar Cambios')}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
