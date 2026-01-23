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

    const { getByText } = await render(<UserInfo></UserInfo>);
    expect(getByText(email)).toBeInTheDocument();
    expect(getByText(displayName)).toBeInTheDocument();
    expect(getByText('Phone number: ')).not.toBeInTheDocument();
    expect(getByText('User avatar')).not.toBeInTheDocument();
  });
  it('should show user info with phone', async () => {
    const email = faker.internet.email();
    const displayName = faker.person.fullName();
    const phoneNumber = faker.phone.number();
    const uid = faker.string.uuid();
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: {
        email,
        uid,
        displayName,
        phoneNumber,
      },
    });

    const { getByText } = await render(<UserInfo></UserInfo>);
    expect(getByText(`Email: ${email}`)).toBeInTheDocument();
    expect(getByText(`Name: ${displayName}`)).toBeInTheDocument();
    expect(getByText(`Phone number: ${phoneNumber}`)).toBeInTheDocument();
    expect(getByText('User avatar')).not.toBeInTheDocument();
  });
  it('should show user info with avatar', async () => {
    const email = faker.internet.email();
    const displayName = faker.person.fullName();
    const photoURL = faker.internet.url();
    const uid = faker.string.uuid();
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: {
        email,
        uid,
        displayName,
        photoURL,
      },
    });

    const { getByText } = await render(<UserInfo></UserInfo>);
    expect(getByText(`Email: ${email}`)).toBeInTheDocument();
    expect(getByText(`Name: ${displayName}`)).toBeInTheDocument();
    expect(getByText('Phone number:')).not.toBeInTheDocument();
    expect(getByText('User avatar')).toBeInTheDocument();
  });
  it('should show user info with all', async () => {
    const email = faker.internet.email();
    const displayName = faker.person.fullName();
    const phoneNumber = faker.phone.number();
    const photoURL = faker.internet.url();
    const uid = faker.string.uuid();
    mocks.useAuth.mockReturnValue({
      loading: false,
      user: {
        email,
        uid,
        displayName,
        phoneNumber,
        photoURL,
      },
    });

    const { getByText } = await render(<UserInfo></UserInfo>);
    expect(getByText(`Email: ${email}`)).toBeInTheDocument();
    expect(getByText(`Name: ${displayName}`)).toBeInTheDocument();
    expect(getByText(`Phone number: ${phoneNumber}`)).toBeInTheDocument();
    expect(getByText('User avatar')).toBeInTheDocument();
  });
  it('should show nothing - loading', async () => {
    const email = faker.internet.email();
    const displayName = faker.person.fullName();
    const phoneNumber = faker.phone.number();
    const photoURL = faker.internet.url();
    const uid = faker.string.uuid();
    mocks.useAuth.mockReturnValue({
      loading: true,
      user: {
        email,
        uid,
        displayName,
        phoneNumber,
        photoURL,
      },
    });

    const { getByText } = await render(<UserInfo></UserInfo>);
    expect(getByText(`Email: ${email}`)).not.toBeInTheDocument();
    expect(getByText(`Name: ${displayName}`)).not.toBeInTheDocument();
    expect(getByText(`Phone number: ${phoneNumber}`)).not.toBeInTheDocument();
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
    expect(getByText('Phone number:')).not.toBeInTheDocument();
    expect(getByText('User avatar')).not.toBeInTheDocument();
  });
});
