import { useTranslation } from 'react-i18next';
import { Bell, User } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

interface Props {
  title: string;
}

export function Topbar({ title }: Props) {
  const { t } = useTranslation();
  const user = getUser();

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-white font-semibold text-base">{title}</h1>

      <div className="flex items-center gap-3">
        <LanguageSwitcher dark />

        <button className="relative w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <User size={15} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-white text-sm font-medium leading-tight">{user?.name || t('app.welcome')}</div>
            <div className="text-slate-500 text-xs">{user?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
