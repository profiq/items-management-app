import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import type { UserType } from '@/services/users/users';
import { createError } from '@/lib/errors';

export async function getOfficePetOwner(id: number, user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<UserType> = await client.fetch(
    HttpMethod.Get,
    `/pets/${id}/owner`
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}
