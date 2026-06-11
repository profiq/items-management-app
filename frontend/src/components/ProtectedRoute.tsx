import { useAuth } from '@/lib/providers/auth/useAuth';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

type ProtectedRouteProps = {
  children?: ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }
  return children ? children : <Outlet />;
}
export default ProtectedRoute;
