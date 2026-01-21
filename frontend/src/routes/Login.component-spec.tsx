import { describe, expect, it, vi } from 'vitest';
import Login from './Login';
import { render } from 'vitest-browser-react';
import type { AuthContextType } from '@/lib/contexts';

describe('Login testing', () => {
  const mocks = vi.hoisted(() => {
    return {
      useAuth: vi.fn(),
    };
  });

  vi.mock(import('@/lib/providers/auth/useAuth'), () => ({
    useAuth: mocks.useAuth,
  }));

  it('should see email', async () => {
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: { email: 'abcd@profiq.com' },
    } as unknown as AuthContextType);

    const { getByText } = await render(<Login></Login>);
    await expect.element(getByText('abcd@profiq.com')).toBeInTheDocument();
    await expect.element(getByText('Logout')).toBeInTheDocument();
    await expect.element(getByText('Loading')).not.toBeInTheDocument();
    await expect
      .element(getByText('Login with Google'))
      .not.toBeInTheDocument();
  });

  it('should see loading', async () => {
    mocks.useAuth.mockReturnValue({
      loading: true,
      user: { email: 'abcde@profiq.com' },
    } as unknown as AuthContextType);

    const { getByText } = await render(<Login></Login>);
    await expect.element(getByText('Loading')).toBeInTheDocument();
    await expect.element(getByText('abcd@profiq.com')).not.toBeInTheDocument();
    await expect.element(getByText('Logout')).not.toBeInTheDocument();
    await expect
      .element(getByText('Login with Google'))
      .not.toBeInTheDocument();
  });

  it('should see login', async () => {
    mocks.useAuth.mockReturnValue({
      loading: false,
    } as unknown as AuthContextType);

    const { getByText } = await render(<Login></Login>);
    await expect.element(getByText('Loading')).not.toBeInTheDocument();
    await expect.element(getByText('abcd@profiq.com')).not.toBeInTheDocument();
    await expect.element(getByText('Logout')).not.toBeInTheDocument();
    await expect.element(getByText('Login with Google')).toBeInTheDocument();
  });
});
