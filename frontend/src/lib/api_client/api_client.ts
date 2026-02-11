import type { StatusCodes } from 'http-status-codes';
import type { User } from '@/lib/contexts';
export type APIResponse<T> = { status_code: StatusCodes; data: T };

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
    const url = import.meta.env.VITE_API_URL + path;
    const headers: Headers = {};
    if (this.user && this.user.getIdToken) {
      const token = await this.user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
      if (data) {
        headers['Content-Type'] = 'application/json';
      }
    }
    const response = await fetch(url, {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) }),
    });
    const { status } = response;
    const result = await response.json();
    return { status_code: status, data: result };
  }
}
