import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { NavigationMenuReference } from './navigation-menu-reference';
import { MemoryRouter } from 'react-router';

describe('Testing nav menu', () => {
  const mocks = vi.hoisted(() => {
    return {
      useAuth: vi.fn(),
    };
  });
  vi.mock(import('@/lib/providers/auth/useAuth'), () => ({
    useAuth: mocks.useAuth,
  }));
  it('should show public links only for non-admin users', async () => {
    mocks.useAuth.mockReturnValue({
      loading: true,
    });
    // MemoryRouter due to the Link in nav menu
    const { getByText } = await render(
      <MemoryRouter>
        <NavigationMenuReference />
      </MemoryRouter>
    );

    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('Login')).toBeInTheDocument();
    expect(getByText('Admin')).not.toBeInTheDocument();
  });
  it('should show admin link for admin users', async () => {
    mocks.useAuth.mockReturnValue({
      loading: true,
      role: 'admin',
    });
    // MemoryRouter due to the Link in nav menu
    const { getByText } = await render(
      <MemoryRouter>
        <NavigationMenuReference />
      </MemoryRouter>
    );

    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('Login')).toBeInTheDocument();
    expect(getByText('Admin')).toBeInTheDocument();
  });
});
