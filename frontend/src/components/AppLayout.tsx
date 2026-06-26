import { Avatar, Button, DropdownMenu, Sheet, cn } from '@profiq/ui';
import UserInfo from '@/components/user-info';
import { LoginDialog } from '@/components/LoginDialog';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { useTheme } from '@/lib/providers/theme/useTheme';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Box, ChevronDown, Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

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

function MobileNavLink({ to, active, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const is = (path: string) => pathname === path;
  const isAdmin = pathname.startsWith('/admin');

  const adminItems = [
    { id: 'admin', label: 'Overview', to: '/admin' },
    { id: 'admin-items', label: 'Items', to: '/admin/items' },
    { id: 'admin-categories', label: 'Categories', to: '/admin/categories' },
    { id: 'admin-locations', label: 'Locations', to: '/admin/locations' },
    { id: 'admin-loans', label: 'Loans', to: '/admin/loans' },
    { id: 'admin-tags', label: 'Tags', to: '/admin/tags' },
  ];

  const adminDropdownItems = adminItems.map(item => ({
    id: item.id,
    label: item.label,
    onSelect: () => navigate(item.to),
  }));

  return (
    <div className='flex min-h-svh flex-col'>
      <header className='sticky top-0 z-50 border-b bg-background/95 shadow-sm backdrop-blur-sm'>
        <div className='flex h-14 items-center gap-3 px-4 md:gap-4 md:px-6'>
          {user && (
            <Sheet
              side='left'
              title='Menu'
              open={mobileNavOpen}
              onOpenChange={setMobileNavOpen}
              trigger={
                <button
                  type='button'
                  className='flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden'
                  aria-label='Open navigation menu'
                  data-testid='mobile-nav-button'
                >
                  <Menu className='h-5 w-5' aria-hidden='true' />
                </button>
              }
            >
              <nav
                className='flex flex-col gap-1 p-2'
                onClick={() => setMobileNavOpen(false)}
              >
                <MobileNavLink to='/dashboard' active={is('/dashboard')}>
                  Dashboard
                </MobileNavLink>
                <MobileNavLink to='/loans' active={is('/loans')}>
                  Loans
                </MobileNavLink>
                {role === 'admin' && (
                  <MobileNavLink to='/employees' active={is('/employees')}>
                    Employees
                  </MobileNavLink>
                )}
                {role === 'admin' && (
                  <div className='mt-2 flex flex-col gap-1'>
                    <span className='px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      Admin
                    </span>
                    {adminItems.map(item => (
                      <MobileNavLink
                        key={item.id}
                        to={item.to}
                        active={pathname === item.to}
                      >
                        {item.label}
                      </MobileNavLink>
                    ))}
                  </div>
                )}
              </nav>
            </Sheet>
          )}

          <Link
            to={user ? '/dashboard' : '/'}
            className='flex shrink-0 items-center gap-2'
          >
            <Box className='h-5 w-5' />
            <span className='font-semibold text-sm'>Items Manager</span>
          </Link>

          <div className='hidden h-5 w-px bg-border md:block' />

          <nav
            className='hidden items-center gap-1 md:flex'
            data-testid='desktop-nav'
          >
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
                items={adminDropdownItems}
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
                    <button
                      className='cursor-pointer rounded-full'
                      data-testid='profile-button'
                    >
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
                <Button
                  variant='outline'
                  size='sm'
                  onClick={logout}
                  data-testid='logout-button'
                >
                  Log out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className='flex-1 p-4 md:p-6'>
        <Outlet />
      </main>

      <LoginDialog open={!loading && !user} />
    </div>
  );
}
