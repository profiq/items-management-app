import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { NavigationMenuReference } from './navigation-menu-reference';
import { MemoryRouter } from 'react-router';
import { faker } from '@faker-js/faker';

describe('Testing nav menu', () => {
  const mocks = vi.hoisted(() => {
    return {
      useAuth: vi.fn(),
    };
  });
  vi.mock(import('@/lib/providers/auth/useAuth'), () => ({
    useAuth: mocks.useAuth,
  }));
  it('should not show link to protected', async () => {
    mocks.useAuth.mockReturnValue({
      loading: true,
    });
    // MemoryRouter due to the Link in nav menu
    const { getByText } = await render(
      <MemoryRouter>
        <NavigationMenuReference />
      </MemoryRouter>
    );

    expect(getByText('Main page')).toBeInTheDocument();
    expect(getByText('Protected Page')).not.toBeInTheDocument();
  });
  it('should show link to protected', async () => {
    const email = faker.internet.email();
    mocks.useAuth.mockReturnValue({
      loading: true,
      user: { email },
    });
    // MemoryRouter due to the Link in nav menu
    const { getByText } = await render(
      <MemoryRouter>
        <NavigationMenuReference />
      </MemoryRouter>
    );

    expect(getByText('Main page')).toBeInTheDocument();
    expect(getByText('Protected Page')).toBeInTheDocument();
  });
});
