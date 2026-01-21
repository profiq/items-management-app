import type { AuthContextType } from '@/lib/contexts';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import ProtectedRoute from './ProtectedRoute';

describe('Protected Route test', () => {
  const mocks = vi.hoisted(() => {
    return {
      useAuth: vi.fn(),
      Navigate: vi.fn(),
      Outlet: vi.fn(),
    };
  });
  mocks.Navigate.mockImplementation(({ to }) => `to=${to}`);

  vi.mock(import('@/lib/providers/auth/useAuth'), () => ({
    useAuth: mocks.useAuth,
  }));

  vi.mock(import('react-router'), () => ({
    Navigate: mocks.Navigate,
    Outlet: mocks.Outlet,
  }));

  it('should show nothing, loading', async () => {
    mocks.useAuth.mockReturnValue({
      loading: true,
    } as unknown as AuthContextType);

    const { getByText } = await render(
      <ProtectedRoute>
        <div>valid login</div>
      </ProtectedRoute>
    );
    expect(getByText('valid login')).not.toBeInTheDocument();
    expect(getByText('to=/login')).not.toBeInTheDocument();
    expect(getByText('to=/logina')).not.toBeInTheDocument();
  });

  it('should redirect, no user, not loading', async () => {
    mocks.useAuth.mockReturnValue({
      loading: false,
    } as unknown as AuthContextType);

    const { getByText } = await render(
      <ProtectedRoute>
        <div>valid login</div>
      </ProtectedRoute>
    );
    expect(getByText('valid login')).not.toBeInTheDocument();
    expect(getByText('to=/login')).toBeInTheDocument();
    expect(getByText('to=/logina')).not.toBeInTheDocument();
  });

  it('should redirect elsewhere, no user, not loading', async () => {
    mocks.useAuth.mockReturnValue({
      loading: false,
    } as unknown as AuthContextType);

    const { getByText } = await render(
      <ProtectedRoute redirectUrl='/abcd'>
        <div>valid login</div>
      </ProtectedRoute>
    );
    expect(getByText('valid login')).not.toBeInTheDocument();
    expect(getByText('to=/login')).not.toBeInTheDocument();
    expect(getByText('to=/abcd')).toBeInTheDocument();
    expect(getByText('to=/logina')).not.toBeInTheDocument();
  });
  it('should show valid, user', async () => {
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: { email: 'abcd@profiq.com' },
    } as unknown as AuthContextType);

    const { getByText } = await render(
      <ProtectedRoute>
        <div>valid login</div>
      </ProtectedRoute>
    );
    expect(getByText('valid login')).toBeInTheDocument();
    expect(getByText('to=/login')).not.toBeInTheDocument();
    expect(getByText('to=/logina')).not.toBeInTheDocument();
  });
});
