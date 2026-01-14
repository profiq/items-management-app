import { useAuth } from '@/lib/providers/auth/useAuth';
import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';

type ProtectedRouteProps = {
  children?: ReactNode;
  redirectUrl?: string;
};

function ProtectedRoute({
  children,
  redirectUrl = '/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  if (loading) {
    return <></>;
  }
  if (!user) {
    return <Navigate to={redirectUrl} />;
  }
  return children ? children : <Outlet />;
}
export default ProtectedRoute;
