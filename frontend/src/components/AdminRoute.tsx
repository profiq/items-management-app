import { useAuth } from '@/lib/providers/auth/useAuth';
import { Alert } from '@profiq/ui';
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
        <Alert
          variant='destructive'
          title='Access Denied'
          description='You do not have permission to view this page.'
        />
      </div>
    );
  }
  return children ? children : <Outlet />;
}

export default AdminRoute;
