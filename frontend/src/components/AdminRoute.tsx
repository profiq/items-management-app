import { useAuth } from '@/lib/providers/auth/useAuth';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@profiq/ui/components/ui/feedback';
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

type AdminRouteProps = {
  children?: ReactNode;
};

function AdminRoute({ children }: AdminRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <></>;
  }
  if (!user) {
    return <Navigate to='/login' replace state={{ from: location.pathname }} />;
  }
  if (role !== 'admin') {
    return (
      <div className='mx-auto max-w-md p-8'>
        <Alert variant='destructive'>
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return children ? children : <Outlet />;
}

export default AdminRoute;
