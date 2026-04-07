import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Breadcrumbs } from './Breadcrumbs';

export function Topbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const env = import.meta.env.MODE;

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-10">
      <Breadcrumbs />

      <div className="flex items-center gap-4">
        {env !== 'production' && (
          <span className="text-xs px-2 py-0.5 bg-warning-light text-warning rounded font-medium uppercase">
            {env}
          </span>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-sm hover:text-primary"
          >
            <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
            <span className="hidden sm:inline">{user?.name}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-20">
              <div className="px-3 py-2 text-xs text-text-muted border-b border-border">
                {user?.email}
                <br />
                <span className="capitalize">{user?.role}</span>
              </div>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-bg text-danger"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
