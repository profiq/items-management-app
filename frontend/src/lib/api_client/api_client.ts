import { StatusCodes } from 'http-status-codes';
import type { User } from '@/lib/contexts';

export type ErrorResponseType = {
  statusCode: StatusCodes;
  message: string;
  error: string;
};
export type APIResponse<T> =
  | { success: true; status_code: StatusCodes; data: T }
  | { success: false; status_code: StatusCodes; error: ErrorResponseType };

export const HttpMethod = {
  Get: 'GET',
  Head: 'HEAD',
  Post: 'POST',
  Put: 'PUT',
  Delete: 'DELETE',
  Connect: 'CONNECT',
  Options: 'OPTIONS',
  Trace: 'TRACE',
  Patch: 'PATCH',
} as const;

export type HttpMethodType = (typeof HttpMethod)[keyof typeof HttpMethod];

type Headers = {
  Authorization?: string;
  'Content-Type'?: string;
};

type RequestConfig = {
  method: HttpMethodType;
  path: string;
  headers?: Headers;
  body?: BodyInit;
  forceRefresh?: boolean;
  retriedAfterUnauthorized?: boolean;
};

export class APIClient {
  user?: User;

  constructor(user?: User) {
    this.user = user;
  }
  async fetch<T>(
    method: HttpMethodType,
    path: string,
    data?: object
  ): Promise<APIResponse<T>> {
    return request<T>(this.user, {
      method,
      path,
      headers: data ? { 'Content-Type': 'application/json' } : undefined,
      ...(data && { body: JSON.stringify(data) }),
    });
  }

  async create_with_image<T>(
    method: HttpMethodType,
    path: string,
    data?: object
  ): Promise<APIResponse<T>> {
    const formData = new FormData();
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        formData.set(key, value);
      }
    }

    return request<T>(this.user, {
      method,
      path,
      body: formData,
    });
  }
}

async function request<T>(
  user: User | undefined,
  config: RequestConfig
): Promise<APIResponse<T>> {
  const url = import.meta.env.VITE_API_URL + config.path;
  const headers = await buildHeaders(user, config);
  const response = await fetch(url, {
    method: config.method,
    headers,
    ...(config.body && { body: config.body }),
  });

  const { status } = response;
  const result = await parseResponse(response);

  if (
    status === StatusCodes.UNAUTHORIZED &&
    user?.getIdToken &&
    !config.retriedAfterUnauthorized
  ) {
    try {
      return await request<T>(user, {
        ...config,
        forceRefresh: true,
        retriedAfterUnauthorized: true,
      });
    } catch (error) {
      await signOutAndRedirectToLogin();
      return unauthorizedResponse<T>(
        error instanceof Error ? error.message : 'Failed to refresh token'
      );
    }
  }

  if (status === StatusCodes.UNAUTHORIZED && config.retriedAfterUnauthorized) {
    await signOutAndRedirectToLogin();
  }

  if (status == StatusCodes.OK || status == StatusCodes.CREATED) {
    return { success: true, status_code: status, data: result as T };
  }

  return {
    success: false,
    status_code: status,
    error: result as ErrorResponseType,
  };
}

async function buildHeaders(
  user: User | undefined,
  config: RequestConfig
): Promise<Headers> {
  const headers = { ...(config.headers ?? {}) };
  if (user?.getIdToken) {
    const token = config.forceRefresh
      ? await user.getIdToken(true)
      : await user.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse(response: Response): Promise<unknown> {
  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : undefined;
}

async function signOutAndRedirectToLogin(): Promise<void> {
  const { auth } = await import('@/firebase');
  await auth.signOut();

  if (typeof window === 'undefined') {
    return;
  }

  const from = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.history.replaceState(
    {
      ...(window.history.state ?? {}),
      usr: { from },
    },
    '',
    '/login'
  );
  window.dispatchEvent(new Event('popstate'));
}

function unauthorizedResponse<T>(message: string): APIResponse<T> {
  return {
    success: false,
    status_code: StatusCodes.UNAUTHORIZED,
    error: {
      statusCode: StatusCodes.UNAUTHORIZED,
      message,
      error: 'Unauthorized',
    },
  };
}
