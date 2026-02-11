import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { StatusCodes } from 'http-status-codes';
import type { OfficePetType } from './office_pets';

type OfficePetUpdateType = {
  owner_id: number;
  name: string;
};

export async function updatePet(
  id: number,
  data: OfficePetUpdateType,
  user?: User
) {
  const client = new APIClient(user);
  const result: APIResponse<OfficePetType> = await client.fetch(
    HttpMethod.Put,
    `/pets/${id}`,
    data
  );
  if (result.status_code != StatusCodes.OK) {
    return Promise.reject(`Could not create the pet! An error occured`);
  }
  return result.data;
}
