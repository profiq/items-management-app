import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { StatusCodes } from 'http-status-codes';
import type { UserType } from '@/services/users/users';

export async function getOfficePetOwner(id: number, user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<UserType> = await client.fetch(
    HttpMethod.Get,
    `/pets/${id}/owner`
  );
  if (result.status_code != StatusCodes.OK) {
    return Promise.reject(`Could not fetch the owner! An error occured`);
  }
  return result.data;
}
