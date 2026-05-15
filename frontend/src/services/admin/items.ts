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

export type AdminTag = {
  id: number;
  name: string;
};

export type AdminItem = {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  default_loan_days: number;
  archived_at: string | null;
  categories: AdminCategory[];
  tags: AdminTag[];
  copies_count?: number;
  available_copies_count?: number;
};

export type AdminItemsResponse = {
  data: AdminItem[];
  total: number;
  page: number;
  limit: number;
};

export type AdminItemPayload = {
  name: string;
  description?: string | null;
  image_url?: string | null;
  default_loan_days: number;
  categoryIds?: number[];
  tagIds?: number[];
};

export type AdminItemsQuery = {
  page: number;
  limit: number;
};

function buildQueryString(query: AdminItemsQuery): string {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });

  return params.toString();
}

function throwIfFailed<T>(result: APIResponse<T>): T {
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }

  return result.data;
}

export async function getAdminItems(
  user: User,
  query: AdminItemsQuery
): Promise<AdminItemsResponse> {
  const client = new APIClient(user);
  const result: APIResponse<AdminItemsResponse> = await client.fetch(
    HttpMethod.Get,
    `/admin/items?${buildQueryString(query)}`
  );

  return throwIfFailed(result);
}

export async function createAdminItem(
  user: User,
  payload: AdminItemPayload
): Promise<AdminItem> {
  const client = new APIClient(user);
  const result: APIResponse<AdminItem> = await client.fetch(
    HttpMethod.Post,
    '/admin/items',
    payload
  );

  return throwIfFailed(result);
}

export async function updateAdminItem(
  user: User,
  id: number,
  payload: AdminItemPayload
): Promise<AdminItem> {
  const client = new APIClient(user);
  const result: APIResponse<AdminItem> = await client.fetch(
    HttpMethod.Patch,
    `/admin/items/${id}`,
    payload
  );

  return throwIfFailed(result);
}

export async function archiveAdminItem(user: User, id: number): Promise<void> {
  const client = new APIClient(user);
  const result: APIResponse<void> = await client.fetch(
    HttpMethod.Delete,
    `/admin/items/${id}`
  );

  return throwIfFailed(result);
}

export async function getAdminCategories(user: User): Promise<AdminCategory[]> {
  const client = new APIClient(user);
  const result: APIResponse<AdminCategory[]> = await client.fetch(
    HttpMethod.Get,
    '/admin/categories'
  );

  return throwIfFailed(result);
}

export async function getAdminTags(user: User): Promise<AdminTag[]> {
  const client = new APIClient(user);
  const result: APIResponse<AdminTag[]> = await client.fetch(
    HttpMethod.Get,
    '/admin/tags'
  );

  return throwIfFailed(result);
}
