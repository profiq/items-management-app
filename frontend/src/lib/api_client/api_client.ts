import type { StatusCodes } from 'http-status-codes';
import { useAuth } from '../providers/auth/useAuth';
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
  async fetch<T>(
    method: HttpMethodType,
    path: string
  ): Promise<APIResponse<T>> {
    const url = import.meta.env.VITE_API_URL + path;
    const { user } = useAuth();
    const headers: Headers = {};
    if (user && user.getIdToken) {
      const token = await user.getIdToken();
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
