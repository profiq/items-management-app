import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { StatusCodes } from 'http-status-codes';
import type { OfficePetType } from './office_pets';

export type OfficePetCreateType = {
  owner_id: number;
  name: string;
  species: string;
  race: string;
};

export async function createPet(data: OfficePetCreateType, user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<OfficePetType> = await client.fetch(
    HttpMethod.Post,
    `/pets/`,
    data
  );
  if (result.status_code != StatusCodes.CREATED) {
    return Promise.reject(`Could not create the pet! An error occured`);
  }
  return result.data;
}
