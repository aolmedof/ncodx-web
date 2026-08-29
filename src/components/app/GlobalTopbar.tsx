import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, LogOut, Search, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/components/ui';

export function GlobalTopbar() {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function handleSignOut() {
    signOut();
    navigate('/signin');
  }

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <header className="z-50 flex h-13 shrink-0 items-center gap-3 border-b border-line bg-surface px-4">
      <Link to="/app" className="flex items-center gap-2 pr-1">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-brand" />
        <span className="text-[13px] font-semibold tracking-tight text-ink">NCODX</span>
      </Link>

      <button
        onClick={() =>
          document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
          )
        }
        className={cn(
          'ml-2 hidden items-center gap-2 rounded-md border border-line bg-canvas py-1.5 pl-2.5 pr-2',
          'text-[13px] text-ink-faint transition-colors hover:border-line-strong hover:text-ink-dim sm:flex',
          'w-56 md:w-72',
        )}
      >
        <Search size={13} className="shrink-0" />
        <span className="flex-1 text-left">{t('app.search', 'Search…')}</span>
        <kbd className="rounded border border-line bg-raised px-1 font-sans text-[11px] text-ink-faint">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      <button
        onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
        className="rounded-md px-2 py-1 text-[12px] font-medium uppercase tracking-wide text-ink-faint transition-colors hover:bg-raised hover:text-ink"
      >
        {i18n.language === 'es' ? 'EN' : 'ES'}
      </button>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-md p-1 pr-1.5 transition-colors hover:bg-raised"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-brand">
              {initial}
            </span>
          )}
          <span className="hidden max-w-32 truncate text-[13px] text-ink-dim md:inline">
            {user?.name}
          </span>
          <ChevronDown size={12} className="text-ink-faint" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1.5 w-52 animate-fade-up overflow-hidden rounded-lg border border-line-strong bg-overlay py-1 shadow-popover"
          >
            <div className="border-b border-line px-3 py-2">
              <p className="truncate text-[13px] font-medium text-ink">{user?.name}</p>
              <p className="truncate text-[12px] text-ink-faint">{user?.email}</p>
            </div>
            <Link
              to="/app/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-ink-dim transition-colors hover:bg-raised hover:text-ink"
            >
              <User size={14} />
              {t('app.profile', 'Profile')}
            </Link>
            <Link
              to="/app/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-ink-dim transition-colors hover:bg-raised hover:text-ink"
            >
              <Settings size={14} />
              {t('app.settings', 'Settings')}
            </Link>
            <div className="my-1 border-t border-line" />
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-critical transition-colors hover:bg-critical-soft"
            >
              <LogOut size={14} />
              {t('auth.signOut', 'Sign out')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
