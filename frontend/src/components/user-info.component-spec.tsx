import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import UserInfo from './user-info';

describe('Testing user info', () => {
  const mocks = vi.hoisted(() => {
    return {
      useAuth: vi.fn(),
    };
  });

  vi.mock(import('@/lib/providers/auth/useAuth'), () => ({
    useAuth: mocks.useAuth,
  }));

  it('should show user info minimal', async () => {
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: { email: 'abcd@profiq.com', uid: 'AAA', displayName: 'Jan Novak' },
    });

    const { getByText } = await render(<UserInfo></UserInfo>);
    expect(getByText('abcd@profiq.com')).toBeInTheDocument();
    expect(getByText('Jan Novak')).toBeInTheDocument();
    expect(getByText('Phone number: ')).not.toBeInTheDocument();
    expect(getByText('User avatar')).not.toBeInTheDocument();
  });
  it('should show user info with phone', async () => {
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: {
        email: 'abcd@profiq.com',
        uid: 'AAA',
        displayName: 'Jan Novak',
        phoneNumber: '123123123',
      },
    });

    const { getByText } = await render(<UserInfo></UserInfo>);
    expect(getByText('abcd@profiq.com')).toBeInTheDocument();
    expect(getByText('Jan Novak')).toBeInTheDocument();
    expect(getByText('Phone number: 123123123')).toBeInTheDocument();
    expect(getByText('User avatar')).not.toBeInTheDocument();
  });
  it('should show user info with avatar', async () => {
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: {
        email: 'abcd@profiq.com',
        uid: 'AAA',
        displayName: 'Jan Novak',
        photoURL: 'example.com',
      },
    });

    const { getByText } = await render(<UserInfo></UserInfo>);
    expect(getByText('abcd@profiq.com')).toBeInTheDocument();
    expect(getByText('Jan Novak')).toBeInTheDocument();
    expect(getByText('Phone number:')).not.toBeInTheDocument();
    expect(getByText('User avatar')).toBeInTheDocument();
  });
  it('should show user info with all', async () => {
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: {
        email: 'abcd@profiq.com',
        uid: 'AAA',
        displayName: 'Jan Novak',
        phoneNumber: '123123123',
        photoURL: 'example.com',
      },
    });

    const { getByText } = await render(<UserInfo></UserInfo>);
    expect(getByText('abcd@profiq.com')).toBeInTheDocument();
    expect(getByText('Jan Novak')).toBeInTheDocument();
    expect(getByText('Phone number: 123123123')).toBeInTheDocument();
    expect(getByText('User avatar')).toBeInTheDocument();
  });
  it('should show nothing - loading', async () => {
    mocks.useAuth.mockReturnValue({
      loading: true,
      user: {
        email: 'abcd@profiq.com',
        uid: 'AAA',
        displayName: 'Jan Novak',
        phoneNumber: '123123123',
        photoURL: 'example.com',
      },
    });

    const { getByText } = await render(<UserInfo></UserInfo>);
    expect(getByText('abcd@profiq.com')).not.toBeInTheDocument();
    expect(getByText('Jan Novak')).not.toBeInTheDocument();
    expect(getByText('Phone number: 123123123')).not.toBeInTheDocument();
    expect(getByText('User avatar')).not.toBeInTheDocument();
  });

  it('should show nothing - no user', async () => {
    mocks.useAuth.mockReturnValue({
      loading: false,
    });

    const { getByText } = await render(<UserInfo></UserInfo>);
    expect(getByText('Email:')).not.toBeInTheDocument();
    expect(getByText('UID: ')).not.toBeInTheDocument();
    expect(getByText('Name: ')).not.toBeInTheDocument();
    expect(getByText('Phone number: 123123123')).not.toBeInTheDocument();
    expect(getByText('User avatar')).not.toBeInTheDocument();
  });
});
