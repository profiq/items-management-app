import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import UserInfo from './user-info';
import { faker } from '@faker-js/faker';

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
    const email = faker.internet.email();
    const displayName = faker.person.fullName();
    const uid = faker.string.uuid();
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: { email, uid, displayName },
    });

    const { getByTestId, getByText } = await render(<UserInfo></UserInfo>);
    expect(getByTestId('user-email')).toHaveTextContent(email);
    expect(getByTestId('user-name')).toHaveTextContent(displayName);
    expect(getByTestId('user-uid')).toHaveTextContent(uid);
    expect(getByText('Phone')).not.toBeInTheDocument();
  });

  it('should show user info with phone', async () => {
    const email = faker.internet.email();
    const displayName = faker.person.fullName();
    const phoneNumber = faker.phone.number();
    const uid = faker.string.uuid();
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: { email, uid, displayName, phoneNumber },
    });

    const { getByTestId } = await render(<UserInfo></UserInfo>);
    expect(getByTestId('user-email')).toHaveTextContent(email);
    expect(getByTestId('user-name')).toHaveTextContent(displayName);
    expect(getByTestId('user-phone')).toHaveTextContent(phoneNumber);
  });

  it('should show photo when photoURL is provided', async () => {
    const email = faker.internet.email();
    const displayName = faker.person.fullName();
    const photoURL = faker.internet.url();
    const uid = faker.string.uuid();
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: { email, uid, displayName, photoURL },
    });

    const { getByTestId, getByRole } = await render(<UserInfo></UserInfo>);
    expect(getByTestId('user-email')).toHaveTextContent(email);
    expect(getByTestId('user-name')).toHaveTextContent(displayName);
    expect(getByRole('img')).toHaveAttribute('src', photoURL);
  });

  it('should show nothing - no user', async () => {
    mocks.useAuth.mockReturnValue({
      loading: false,
    });

    const { getByTestId } = await render(<UserInfo></UserInfo>);
    expect(getByTestId('user-info')).not.toBeInTheDocument();
  });
});
