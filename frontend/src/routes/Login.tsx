import { Button } from '@/components/ui/button';
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
        <div>Loading</div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div>
          <Button
            className='cursor-pointer'
            variant='outline'
            onClick={handleLogin}
            disabled={signingIn}
          >
            Login With Google
          </Button>
          <div className='text-red-500'>{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <div>
          Logged in as {user.email}, {user.displayName}
        </div>
        <Button className='cursor-pointer' variant='outline' onClick={logout}>
          Logout
        </Button>
      </div>
    </>
  );
}
export default Login;
