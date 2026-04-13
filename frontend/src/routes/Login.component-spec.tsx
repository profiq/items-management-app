import { describe, expect, it, vi } from 'vitest';
import Login from './Login';
import { render } from 'vitest-browser-react';
import type { AuthContextType } from '@/lib/contexts';
import { faker } from '@faker-js/faker';
import { MemoryRouter } from 'react-router';

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
    const email = faker.internet.email();
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: { email },
    } as unknown as AuthContextType);

    const { getByText, getByRole } = await render(
      <MemoryRouter>
        <Login></Login>
      </MemoryRouter>
    );
    await expect.element(getByText(email)).toBeInTheDocument();
    await expect
      .element(getByRole('button').getByText('Logout'))
      .toBeInTheDocument();
    await expect.element(getByText('Loading')).not.toBeInTheDocument();
    await expect
      .element(getByText('Login with Google'))
      .not.toBeInTheDocument();
  });

  it('should see loading', async () => {
    const email = faker.internet.email();
    mocks.useAuth.mockReturnValue({
      loading: true,
      user: { email },
    } as unknown as AuthContextType);

    const { getByText, getByTestId } = await render(
      <MemoryRouter>
        <Login></Login>
      </MemoryRouter>
    );
    await expect.element(getByTestId('login-loading')).toBeInTheDocument();
    await expect.element(getByText(email)).not.toBeInTheDocument();
    await expect.element(getByText('Logout')).not.toBeInTheDocument();
    await expect
      .element(getByText('Login with Google'))
      .not.toBeInTheDocument();
  });

  it('should see login', async () => {
    const email = faker.internet.email();
    mocks.useAuth.mockReturnValue({
      loading: false,
    } as unknown as AuthContextType);

    const { getByText } = await render(
      <MemoryRouter>
        <Login></Login>
      </MemoryRouter>
    );
    await expect.element(getByText('Loading')).not.toBeInTheDocument();
    await expect.element(getByText(email)).not.toBeInTheDocument();
    await expect.element(getByText('Logout')).not.toBeInTheDocument();
    await expect.element(getByText('Login with Google')).toBeInTheDocument();
  });
});
