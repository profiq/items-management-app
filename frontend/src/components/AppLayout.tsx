import { Avatar, Button, Text, cn } from '@profiq/ui';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { Link, Outlet, useLocation } from 'react-router';
import { Box } from 'lucide-react';

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
  const { user, role, logout } = useAuth();
  const { pathname } = useLocation();

  const is = (path: string) => pathname === path;

  return (
    <div className='flex min-h-svh flex-col'>
      <header className='sticky top-0 z-50 border-b bg-background/95 shadow-sm backdrop-blur-sm'>
        <div className='flex h-14 items-center gap-4 px-6'>
          <Link to='/' className='flex shrink-0 items-center gap-2'>
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
              <NavLink to='/profile' active={is('/profile')}>
                Profil
              </NavLink>
            )}
            {user && (
              <NavLink to='/employees' active={is('/employees')}>
                Zaměstnanci
              </NavLink>
            )}
            {user && role === 'admin' && (
              <NavLink to='/admin' active={is('/admin')}>
                Admin
              </NavLink>
            )}
            {user && role === 'admin' && (
              <NavLink to='/admin/items' active={is('/admin/items')}>
                Admin Items
              </NavLink>
            )}
          </nav>

          <div className='flex-1' />

          <div className='flex items-center gap-3'>
            {user ? (
              <>
                <div className='hidden flex-col items-end sm:flex'>
                  {user.displayName && (
                    <Text as='p' size='xs' weight='medium'>
                      {user.displayName}
                    </Text>
                  )}
                  <Text as='p' size='xs' className='text-muted-foreground'>
                    {user.email}
                  </Text>
                </div>
                {user.photoURL && (
                  <Avatar
                    isGroup={false}
                    item={{
                      id: 'current-user',
                      imgSource: user.photoURL,
                      imgAlt: user.displayName ?? 'User',
                      size: 'sm',
                    }}
                    fallback={user.displayName?.[0] ?? '?'}
                  />
                )}
                <Button variant='outline' size='sm' onClick={logout}>
                  Odhlásit
                </Button>
              </>
            ) : (
              <NavLink to='/login' active={is('/login')}>
                Přihlásit
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className='flex-1 p-6'>
        <Outlet />
      </main>
    </div>
  );
}
