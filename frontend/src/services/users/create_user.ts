import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import type { UserType } from './users';
import { createError } from '@/lib/errors';

export type CreateUserType = {
  name: string;
  workspace_id: string;
};

export async function createUser(data: CreateUserType, user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<UserType> = await client.fetch(
    HttpMethod.Post,
    `/users`,
    data
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}
