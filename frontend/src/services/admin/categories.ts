import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import { createError } from '@/lib/errors';
import type { User } from '@/lib/contexts';

export type AdminCategory = {
  id: number;
  name: string;
  archived_at: string | null;
};

export type AdminCategoryPayload = {
  name: string;
};

function throwIfFailed<T>(result: APIResponse<T>): T {
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}

export async function getAdminCategories(user: User): Promise<AdminCategory[]> {
  const client = new APIClient(user);
  const result: APIResponse<AdminCategory[]> = await client.fetch(
    HttpMethod.Get,
    '/admin/categories'
  );
  return throwIfFailed(result);
}

export async function createAdminCategory(
  user: User,
  payload: AdminCategoryPayload
): Promise<AdminCategory> {
  const client = new APIClient(user);
  const result: APIResponse<AdminCategory> = await client.fetch(
    HttpMethod.Post,
    '/admin/categories',
    payload
  );
  return throwIfFailed(result);
}

export async function updateAdminCategory(
  user: User,
  id: number,
  payload: AdminCategoryPayload
): Promise<AdminCategory> {
  const client = new APIClient(user);
  const result: APIResponse<AdminCategory> = await client.fetch(
    HttpMethod.Patch,
    `/admin/categories/${id}`,
    payload
  );
  return throwIfFailed(result);
}

export async function archiveAdminCategory(
  user: User,
  id: number
): Promise<void> {
  const client = new APIClient(user);
  const result: APIResponse<void> = await client.fetch(
    HttpMethod.Delete,
    `/admin/categories/${id}`
  );
  return throwIfFailed(result);
}
