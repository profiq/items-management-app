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
};

export class APIClient {
  user?: User;

  constructor(user?: User) {
    this.user = user;
  }
  async fetch<T>(
    method: HttpMethodType,
    path: string
  ): Promise<APIResponse<T>> {
    const url = import.meta.env.VITE_API_URL + path;
    const headers: Headers = {};
    if (this.user && this.user.getIdToken) {
      const token = await this.user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(url, {
      method,
      headers,
    });
    const { status } = response;
    const result = await response.json();
    return { status_code: status, data: result };
  }
}
