import { afterEach, describe, expect, it, vi } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import { APIClient, HttpMethod } from './api_client';
import type { User } from '@/lib/contexts';

const { signOutMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(),
}));

vi.mock('@/firebase', () => ({
  auth: {
    signOut: signOutMock,
  },
}));

function jsonResponse(body: object, status: StatusCodes): Response {
  return new Response(JSON.stringify(body), { status });
}

function createUser(getIdToken: User['getIdToken']): User {
  return {
    uid: 'firebase-user',
    providerId: 'firebase',
    displayName: 'Test User',
    email: 'test@profiq.com',
    phoneNumber: null,
    photoURL: null,
    getIdToken,
  };
}

describe('APIClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('force-refreshes the token and retries once after a 401', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');
    const getIdToken = vi
      .fn<NonNullable<User['getIdToken']>>()
      .mockResolvedValueOnce('cached-token')
      .mockResolvedValueOnce('refreshed-token');
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse(
          { statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' },
          StatusCodes.UNAUTHORIZED
        )
      )
      .mockResolvedValueOnce(jsonResponse({ id: 1 }, StatusCodes.OK));
    vi.stubGlobal('fetch', fetchMock);

    const client = new APIClient(createUser(getIdToken));
    const result = await client.fetch<{ id: number }>(
      HttpMethod.Get,
      '/auth/me'
    );

    expect(result).toEqual({
      success: true,
      status_code: StatusCodes.OK,
      data: { id: 1 },
    });
    expect(getIdToken).toHaveBeenNthCalledWith(1);
    expect(getIdToken).toHaveBeenNthCalledWith(2, true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.example.test/auth/me',
      expect.objectContaining({
        headers: { Authorization: 'Bearer cached-token' },
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.example.test/auth/me',
      expect.objectContaining({
        headers: { Authorization: 'Bearer refreshed-token' },
      })
    );
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it('signs out and redirects to login when token refresh fails', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');
    const getIdToken = vi
      .fn<NonNullable<User['getIdToken']>>()
      .mockResolvedValueOnce('cached-token')
      .mockRejectedValueOnce(new Error('refresh failed'));
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse(
          { statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' },
          StatusCodes.UNAUTHORIZED
        )
      );
    const history: {
      state: unknown;
      replaceState: (state: unknown) => void;
    } = {
      state: { idx: 1, key: 'current' },
      replaceState: vi.fn((state: unknown) => {
        history.state = state;
      }),
    };
    const dispatchEvent = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', {
      location: {
        pathname: '/items',
        search: '?page=2',
        hash: '#copy-3',
      },
      history,
      dispatchEvent,
    });

    const client = new APIClient(createUser(getIdToken));
    const result = await client.fetch<{ id: number }>(
      HttpMethod.Get,
      '/auth/me'
    );

    expect(result).toEqual({
      success: false,
      status_code: StatusCodes.UNAUTHORIZED,
      error: {
        statusCode: StatusCodes.UNAUTHORIZED,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    });
    expect(getIdToken).toHaveBeenNthCalledWith(1);
    expect(getIdToken).toHaveBeenNthCalledWith(2, true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(history.replaceState).toHaveBeenCalledWith(
      { idx: 1, key: 'current', usr: { from: '/items?page=2#copy-3' } },
      '',
      '/login'
    );
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
  });
});
