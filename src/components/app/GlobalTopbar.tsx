import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Terminal, ChevronDown, User, Settings, LogOut, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function GlobalTopbar() {
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSignOut() {
    signOut();
    navigate('/signin');
  }

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
  };

  return (
    <header className="h-12 bg-signal-surface border-b border-signal-border flex items-center px-4 gap-4 flex-shrink-0 z-50">
      {/* Logo */}
      <Link to="/app" className="flex items-center gap-2 text-signal-green font-bold text-sm tracking-wider mr-4">
        <Terminal size={16} className="text-signal-green" />
        <span>NCODX</span>
      </Link>

      {/* Divider */}
      <div className="h-4 w-px bg-signal-border" />

      {/* Search hint */}
      <button
        onClick={() => {
          const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
          document.dispatchEvent(event);
        }}
        className="flex items-center gap-2 text-signal-text-dim text-xs px-2 py-1 rounded border border-signal-border hover:border-signal-border-bright transition-colors"
      >
        <Search size={12} />
        <span className="hidden sm:inline">{t('app.search', 'Buscar...')}</span>
        <span className="hidden sm:inline text-signal-text-muted ml-2">⌘K</span>
      </button>

      <div className="flex-1" />

      {/* Lang switcher */}
      <button
        onClick={toggleLang}
        className="text-xs text-signal-text-dim hover:text-signal-green transition-colors uppercase tracking-widest"
      >
        {i18n.language === 'es' ? 'EN' : 'ES'}
      </button>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 text-sm text-signal-text hover:text-signal-green transition-colors"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-signal-border" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-signal-card border border-signal-border-bright flex items-center justify-center text-xs text-signal-green font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="hidden md:inline text-xs text-signal-text-dim">{user?.name}</span>
          <ChevronDown size={12} className="text-signal-text-muted" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-signal-card border border-signal-border rounded shadow-signal-card z-50 py-1">
            <Link
              to="/app/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-signal-text hover:bg-signal-surface hover:text-signal-green transition-colors"
            >
              <User size={13} />
              {t('app.profile', 'Mi Perfil')}
            </Link>
            <Link
              to="/app/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-signal-text hover:bg-signal-surface hover:text-signal-green transition-colors"
            >
              <Settings size={13} />
              {t('app.settings', 'Configuración')}
            </Link>
            <div className="my-1 border-t border-signal-border" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-signal-surface transition-colors"
            >
              <LogOut size={13} />
              {t('auth.signOut', 'Cerrar Sesión')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
