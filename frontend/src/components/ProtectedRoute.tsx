import { useAuth } from '@/lib/providers/auth/useAuth';
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

type ProtectedRouteProps = {
  children?: ReactNode;
  redirectUrl?: string;
};

function ProtectedRoute({
  children,
  redirectUrl = '/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <></>;
  }
  if (!user) {
    return (
      <Navigate to={redirectUrl} state={{ from: location.pathname }} replace />
    );
  }
  return children ? children : <Outlet />;
}
export default ProtectedRoute;
