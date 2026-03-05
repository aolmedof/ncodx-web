import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface Props {
  className?: string;
  dark?: boolean;
}

export function LanguageSwitcher({ className = '', dark = false }: Props) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('es') ? 'es' : 'en';

  const toggle = () => {
    i18n.changeLanguage(current === 'es' ? 'en' : 'es');
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        dark
          ? 'text-slate-400 hover:text-white hover:bg-slate-700'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      } ${className}`}
    >
      <Globe size={15} />
      <span className="uppercase">{current === 'es' ? 'EN' : 'ES'}</span>
    </button>
  );
}
