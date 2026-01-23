import type { AuthContextType } from '@/lib/contexts';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import ProtectedRoute from './ProtectedRoute';
import { faker } from '@faker-js/faker';

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
    const valid_string = faker.string.alpha({ length: { min: 5, max: 10 } });
    mocks.useAuth.mockReturnValue({
      loading: true,
    } as unknown as AuthContextType);

    const { getByText } = await render(
      <ProtectedRoute>
        <div>{valid_string}</div>
      </ProtectedRoute>
    );
    expect(getByText(`${valid_string}`)).not.toBeInTheDocument();
    expect(getByText('to=/login')).not.toBeInTheDocument();
    expect(getByText('to=/logina')).not.toBeInTheDocument();
  });

  it('should redirect, no user, not loading', async () => {
    const valid_string = faker.string.alpha({ length: { min: 5, max: 10 } });
    mocks.useAuth.mockReturnValue({
      loading: false,
    } as unknown as AuthContextType);

    const { getByText } = await render(
      <ProtectedRoute>
        <div>{valid_string}</div>
      </ProtectedRoute>
    );
    expect(getByText(`${valid_string}`)).not.toBeInTheDocument();
    expect(getByText('to=/login')).toBeInTheDocument();
    expect(getByText('to=/logina')).not.toBeInTheDocument();
  });

  it('should redirect elsewhere, no user, not loading', async () => {
    const valid_string = faker.string.alpha({ length: { min: 5, max: 10 } });
    const redirect = faker.internet.url();
    mocks.useAuth.mockReturnValue({
      loading: false,
    } as unknown as AuthContextType);

    const { getByText } = await render(
      <ProtectedRoute redirectUrl={redirect}>
        <div>{valid_string}</div>
      </ProtectedRoute>
    );
    expect(getByText(`${valid_string}`)).not.toBeInTheDocument();
    expect(getByText('to=/login')).not.toBeInTheDocument();
    expect(getByText(`to=${redirect}`)).toBeInTheDocument();
    expect(getByText('to=/logina')).not.toBeInTheDocument();
  });
  it('should show valid, user', async () => {
    const valid_string = faker.string.alpha({ length: { min: 5, max: 10 } });
    const email = faker.internet.email();
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: { email },
    } as unknown as AuthContextType);

    const { getByText } = await render(
      <ProtectedRoute>
        <div>{valid_string}</div>
      </ProtectedRoute>
    );
    expect(getByText(`${valid_string}`)).toBeInTheDocument();
    expect(getByText('to=/login')).not.toBeInTheDocument();
    expect(getByText('to=/logina')).not.toBeInTheDocument();
  });
  it('should show valid, user, custom redirect', async () => {
    const valid_string = faker.string.alpha({ length: { min: 5, max: 10 } });
    const email = faker.internet.email();
    const redirect = faker.internet.url();
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: { email },
    } as unknown as AuthContextType);

    const { getByText } = await render(
      <ProtectedRoute redirectUrl={redirect}>
        <div>{valid_string}</div>
      </ProtectedRoute>
    );
    expect(getByText(`${valid_string}`)).toBeInTheDocument();
    expect(getByText('to=/login')).not.toBeInTheDocument();
    expect(getByText(`to=${redirect}`)).not.toBeInTheDocument();
    expect(getByText('to=/logina')).not.toBeInTheDocument();
  });
});
