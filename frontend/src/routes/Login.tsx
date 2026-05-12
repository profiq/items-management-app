import { HoverInfo } from '@/components/hover-info';
import { Button } from '@profiq/ui/components/ui/form';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Skeleton,
} from '@profiq/ui/components/ui/feedback';
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
        <Skeleton className='h-9 w-40 rounded-md' />
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
          <h1 className='text-2xl font-semibold tracking-tight'>Login</h1>
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
          <Alert
            variant='destructive'
            className='mt-4'
            data-testid='login-error'
          >
            <AlertTitle>Login failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
        <h1 className='text-2xl font-semibold tracking-tight'>Logout</h1>
      </div>
      <p className='text-sm text-muted-foreground' data-testid='logged-in-user'>
        Logged in as {user.email}, {user.displayName}
      </p>
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
