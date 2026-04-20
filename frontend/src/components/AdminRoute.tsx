import { useAuth } from '@/lib/providers/auth/useAuth';
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
      <div className='p-8 text-center'>
        <h2 className='text-2xl font-bold mb-2'>Access Denied</h2>
        <p className='text-gray-600'>
          You do not have permission to view this page.
        </p>
      </div>
    );
  }
  return children ? children : <Outlet />;
}

export default AdminRoute;
