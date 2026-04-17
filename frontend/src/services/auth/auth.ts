import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { createError } from '@/lib/errors';
import type { UserRole } from '@/lib/contexts';

export type DbUser = {
  id: number;
  name: string;
  role: UserRole;
};

export async function loginToBackend(user: User): Promise<DbUser> {
  const client = new APIClient(user);
  const result: APIResponse<DbUser> = await client.fetch(
    HttpMethod.Post,
    '/auth/login'
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}

export async function getMe(user: User): Promise<DbUser> {
  const client = new APIClient(user);
  const result: APIResponse<DbUser> = await client.fetch(
    HttpMethod.Get,
    '/auth/me'
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}
