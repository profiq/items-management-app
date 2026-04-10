import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { createError } from '@/lib/errors';

export interface TableInfo {
  name: string;
  label: string;
  endpoint: string;
}

export async function getTables(user?: User): Promise<TableInfo[]> {
  const client = new APIClient(user);
  const result: APIResponse<TableInfo[]> = await client.fetch(
    HttpMethod.Get,
    '/admin/tables'
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}

export async function getTableData(
  user: User,
  endpoint: string
): Promise<Record<string, unknown>[]> {
  const client = new APIClient(user);
  const result: APIResponse<Record<string, unknown>[]> = await client.fetch(
    HttpMethod.Get,
    endpoint
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}

export async function deleteTableItem(
  user: User,
  endpoint: string,
  id: number
): Promise<void> {
  const client = new APIClient(user);
  const result: APIResponse<void> = await client.fetch(
    HttpMethod.Delete,
    `${endpoint}/${id}`
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
}
