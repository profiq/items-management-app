import { HoverInfo } from '@/components/hover-info';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/lib/providers/auth/useAuth';
import { useState } from 'react';

function Login() {
  const { loading, user, login, signingIn, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handleLogin = async () => {
    const result = await login?.();
    if (result === undefined) {
      // Error persists if the user logs in validly later
      // and shows after logout, so clear it after success
      setError(null);
      return;
    }
    setError(result);
  };
  if (loading) {
    return (
      <>
        <div data-testid='login-loading'>Loading</div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div data-testid='login-page'>
          <Card className='mx-auto w-full max-w-sm'>
            <CardHeader>
              <CardTitle>
                <div className='relative'>
                  <div className='absolute top-0 right-0'>
                    <HoverInfo
                      text={'We use Firebase Auth for authentication'}
                      iconSize={4}
                      readmeSection={{ label: 'Auth', id: 'auth' }}
                    />
                  </div>
                </div>
                Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className='cursor-pointer w-full'
                variant='outline'
                onClick={handleLogin}
                disabled={signingIn}
                data-testid='login-button'
              >
                Login With Google
              </Button>
            </CardContent>
            <CardFooter>
              <div className='text-red-500' data-testid='login-error'>
                {error}
              </div>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <div data-testid='logout-page'>
        <Card className='mx-auto w-full max-w-sm'>
          <CardHeader>
            <CardTitle>
              <div className='relative'>
                <div className='absolute top-0 right-0'>
                  <HoverInfo
                    text={'We use Firebase Auth for authentication'}
                    iconSize={4}
                    readmeSection={{ label: 'Auth', id: 'auth' }}
                  />
                </div>
              </div>
              Logout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid='logged-in-user'>
              Logged in as {user.email}, {user.displayName}
            </div>
            <Button
              className='cursor-pointer w-full mt-3'
              variant='outline'
              onClick={logout}
              data-testid='logout-button'
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
export default Login;
