import { Avatar, Button, DropdownMenu, Sheet, cn } from '@profiq/ui';
import UserInfo from '@/components/user-info';
import { LoginDialog } from '@/components/LoginDialog';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { useTheme } from '@/lib/providers/theme/useTheme';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Box, ChevronDown, Moon, Sun } from 'lucide-react';

type NavLinkProps = {
  to: string;
  active: boolean;
  children: React.ReactNode;
};

function NavLink({ to, active, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {children}
    </Link>
  );
}

export function AppLayout() {
  const { user, role, logout, loading } = useAuth();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const is = (path: string) => pathname === path;
  const isAdmin = pathname.startsWith('/admin');

  const adminItems = [
    { id: 'admin', label: 'Overview', onSelect: () => navigate('/admin') },
    {
      id: 'admin-items',
      label: 'Items',
      onSelect: () => navigate('/admin/items'),
    },
    {
      id: 'admin-categories',
      label: 'Categories',
      onSelect: () => navigate('/admin/categories'),
    },
    {
      id: 'admin-locations',
      label: 'Locations',
      onSelect: () => navigate('/admin/locations'),
    },
    {
      id: 'admin-loans',
      label: 'Loans',
      onSelect: () => navigate('/admin/loans'),
    },
    {
      id: 'admin-tags',
      label: 'Tags',
      onSelect: () => navigate('/admin/tags'),
    },
  ];

  return (
    <div className='flex min-h-svh flex-col'>
      <header className='sticky top-0 z-50 border-b bg-background/95 shadow-sm backdrop-blur-sm'>
        <div className='flex h-14 items-center gap-4 px-6'>
          <Link
            to={user ? '/dashboard' : '/'}
            className='flex shrink-0 items-center gap-2'
          >
            <Box className='h-5 w-5' />
            <span className='font-semibold text-sm'>Items Manager</span>
          </Link>

          <div className='h-5 w-px bg-border' />

          <nav className='flex items-center gap-1'>
            {user && (
              <NavLink to='/dashboard' active={is('/dashboard')}>
                Dashboard
              </NavLink>
            )}
            {user && (
              <NavLink to='/loans' active={is('/loans')}>
                Loans
              </NavLink>
            )}
            {user && role === 'admin' && (
              <NavLink to='/employees' active={is('/employees')}>
                Employees
              </NavLink>
            )}
            {user && role === 'admin' && (
              <DropdownMenu
                trigger={
                  <button
                    className={cn(
                      'flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                      isAdmin
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    Admin
                    <ChevronDown className='h-3.5 w-3.5' />
                  </button>
                }
                items={adminItems}
                align='start'
              />
            )}
          </nav>

          <div className='flex-1' />

          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon-sm'
              ariaLabel={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              onClick={toggle}
            >
              {theme === 'dark' ? (
                <Sun aria-hidden='true' />
              ) : (
                <Moon aria-hidden='true' />
              )}
            </Button>
            {user && (
              <>
                <Sheet
                  side='right'
                  title='Profile'
                  trigger={
                    <button className='cursor-pointer rounded-full'>
                      <Avatar
                        isGroup={false}
                        item={{
                          id: 'current-user',
                          imgSource: user.photoURL ?? '',
                          imgAlt: user.displayName ?? 'User',
                          size: 'lg',
                        }}
                        fallback={
                          user.displayName?.[0] ?? user.email?.[0] ?? '?'
                        }
                      />
                    </button>
                  }
                >
                  <UserInfo />
                </Sheet>
                <Button variant='outline' size='sm' onClick={logout}>
                  Log out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className='flex-1 p-6'>
        <Outlet />
      </main>

      <LoginDialog open={!loading && !user} />
    </div>
  );
}
