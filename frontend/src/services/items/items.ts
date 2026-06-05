import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import { createError } from '@/lib/errors';
import type { User } from '@/lib/contexts';

export type PublicCategory = {
  id: number;
  name: string;
  archived_at: string | null;
};

export type PublicItem = {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  default_loan_days: number;
  archived_at: string | null;
  categories: PublicCategory[];
  copies_count?: number;
  available_copies_count?: number;
};

export type PublicItemsResponse = {
  data: PublicItem[];
  total: number;
  page: number;
  limit: number;
};

export type GetItemsQuery = {
  search?: string;
  categoryId?: number;
  available?: boolean;
  page?: number;
  limit?: number;
};

function throwIfFailed<T>(result: APIResponse<T>): T {
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}

export async function getItems(
  user: User | undefined,
  query: GetItemsQuery
): Promise<PublicItemsResponse> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.categoryId !== undefined)
    params.set('categoryId', String(query.categoryId));
  if (query.available !== undefined)
    params.set('available', String(query.available));
  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.limit ?? 12));

  const client = new APIClient(user);
  const result: APIResponse<PublicItemsResponse> = await client.fetch(
    HttpMethod.Get,
    `/items?${params.toString()}`
  );
  return throwIfFailed(result);
}

export async function getCategories(
  user: User | undefined
): Promise<PublicCategory[]> {
  const client = new APIClient(user);
  const result: APIResponse<PublicCategory[]> = await client.fetch(
    HttpMethod.Get,
    '/categories'
  );
  return throwIfFailed(result);
}
