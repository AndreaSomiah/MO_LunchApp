import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { avatarEmoji } from '@/data/avatarOptions';
import { isOrderingOpen, cutoffTimeDisplay } from '@/lib/cutoffUtils';
import { RraLogo } from '@/components/RraLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  roles: Array<'employee' | 'manager' | 'admin'>;
}

const NAV: NavItem[] = [
  { to: '/dashboard',           label: 'Dashboard',  roles: ['manager', 'admin'] },
  { to: '/orders',              label: 'Orders',     roles: ['employee', 'manager', 'admin'] },
  { to: '/inventory-dashboard', label: 'Inventory',  roles: ['manager', 'admin'] },
  { to: '/settings',            label: 'Settings',   roles: ['admin', 'manager'] },
  { to: '/profile',             label: 'Profile',    roles: ['employee', 'manager', 'admin'] },
];

const BANNER_ROUTES = ['/orders', '/dashboard', '/inventory-dashboard'];

export const AppShell = (): JSX.Element => {
  const { user, signOut } = useAuth();
  const { data: settings } = useSettings();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (!user) {
    return <Outlet />;
  }
  const visible = NAV.filter((n) => n.roles.includes(user.role));
  const orderingOpen = settings ? isOrderingOpen(settings) : true;
  const showBanner = !orderingOpen && BANNER_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="flex items-center px-5 py-4">
          <RraLogo variant="icon" size="md" />        
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {visible.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  'block rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-100'
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3 text-xs text-slate-500">
          v0.1
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="md:hidden">
            <RraLogo variant="icon" size="sm" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xl" aria-hidden>{avatarEmoji(user.avatarId)}</span>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleSignOut}>Sign out</Button>
          </div>
        </header>
        {showBanner && (
          <div className="flex items-center gap-3 border-b border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
            <Clock aria-hidden className="h-4 w-4 shrink-0" />
            <span>Today's ordering is closed. Orders open again tomorrow at {cutoffTimeDisplay(settings)}.</span>
          </div>
        )}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
