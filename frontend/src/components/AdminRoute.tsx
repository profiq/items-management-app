import { useAuth } from '@/lib/providers/auth/useAuth';
import { Alert } from '@profiq/ui';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

type AdminRouteProps = {
  children?: ReactNode;
};

function AdminRoute({ children }: AdminRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading || !user) {
    return null;
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
