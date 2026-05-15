import { HoverInfo } from '@/components/hover-info';
import { Alert, Button, Text } from '@profiq/ui';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { z } from 'zod';

const loginStateSchema = z.object({ from: z.string() }).partial().nullable();

function getRedirectFrom(state: unknown): string {
  const parsed = loginStateSchema.safeParse(state);
  return parsed.success ? (parsed.data?.from ?? '/') : '/';
}

function Login() {
  const { loading, user, login, signingIn, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = getRedirectFrom(location.state);

  const handleLogin = async () => {
    setError(null);
    const result = await login?.();
    if (result !== undefined) {
      setError(result);
      return;
    }
    navigate(from, { replace: true });
  };

  if (loading) {
    return (
      <div
        data-testid='login-loading'
        className='flex justify-center p-8'
        aria-busy='true'
      >
        <div className='h-9 w-40 animate-pulse rounded-md bg-muted' />
        <span className='sr-only'>Loading</span>
      </div>
    );
  }

  if (!user) {
    return (
      <section
        data-testid='login-page'
        className='mx-auto w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm'
      >
        <div className='relative mb-6'>
          <div className='absolute top-0 right-0'>
            <HoverInfo
              text={'We use Firebase Auth for authentication'}
              iconSize={4}
              readmeSection={{ label: 'Auth', id: 'auth' }}
            />
          </div>
          <Text as='h1' size='2xl' weight='semibold'>
            Login
          </Text>
        </div>
        <Button
          className='w-full cursor-pointer'
          variant='outline'
          onClick={handleLogin}
          disabled={signingIn}
          data-testid='login-button'
        >
          {signingIn ? 'Signing in...' : 'Login with Google'}
        </Button>
        {error && (
          <div data-testid='login-error'>
            <Alert
              variant='destructive'
              className='mt-4'
              title='Login failed'
              description={error}
            />
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      data-testid='logout-page'
      className='mx-auto w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm'
    >
      <div className='relative mb-6'>
        <div className='absolute top-0 right-0'>
          <HoverInfo
            text={'We use Firebase Auth for authentication'}
            iconSize={4}
            readmeSection={{ label: 'Auth', id: 'auth' }}
          />
        </div>
        <Text as='h1' size='2xl' weight='semibold'>
          Logout
        </Text>
      </div>
      <Text
        as='p'
        size='sm'
        className='text-muted-foreground'
        dataTestId='logged-in-user'
      >
        Logged in as {user.email ?? 'unknown'},{' '}
        {user.displayName ?? user.email ?? 'User'}
      </Text>
      <Button
        className='mt-3 w-full cursor-pointer'
        variant='outline'
        onClick={logout}
        data-testid='logout-button'
      >
        Logout
      </Button>
    </section>
  );
}

export default Login;
