import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { StatusCodes } from 'http-status-codes';
import type { OfficePetType } from './office_pets';

export async function deletePet(id: number, user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<OfficePetType> = await client.fetch(
    HttpMethod.Delete,
    `/pets/${id}`
  );
  if (result.status_code != StatusCodes.OK) {
    return Promise.reject(`Could not delete the pet! An error occured`);
  }
  return result.data;
}
