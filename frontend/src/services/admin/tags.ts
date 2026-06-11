import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import { createError } from '@/lib/errors';
import type { User } from '@/lib/contexts';

export type AdminTag = {
  id: number;
  name: string;
};

export type AdminTagPayload = {
  name: string;
};

function throwIfFailed<T>(result: APIResponse<T>): T {
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}

export async function getAdminTags(user: User): Promise<AdminTag[]> {
  const client = new APIClient(user);
  const result: APIResponse<AdminTag[]> = await client.fetch(
    HttpMethod.Get,
    '/admin/tags'
  );
  return throwIfFailed(result);
}

export async function createAdminTag(
  user: User,
  payload: AdminTagPayload
): Promise<AdminTag> {
  const client = new APIClient(user);
  const result: APIResponse<AdminTag> = await client.fetch(
    HttpMethod.Post,
    '/admin/tags',
    payload
  );
  return throwIfFailed(result);
}

export async function updateAdminTag(
  user: User,
  id: number,
  payload: AdminTagPayload
): Promise<AdminTag> {
  const client = new APIClient(user);
  const result: APIResponse<AdminTag> = await client.fetch(
    HttpMethod.Patch,
    `/admin/tags/${id}`,
    payload
  );
  return throwIfFailed(result);
}

export async function deleteAdminTag(user: User, id: number): Promise<void> {
  const client = new APIClient(user);
  const result: APIResponse<void> = await client.fetch(
    HttpMethod.Delete,
    `/admin/tags/${id}`
  );
  return throwIfFailed(result);
}
