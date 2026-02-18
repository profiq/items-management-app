import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { StatusCodes } from 'http-status-codes';
import type { PetVisitType } from '@/services/pet_visits/pet_visits';

export async function getOfficePetVisits(id: number, user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<PetVisitType[]> = await client.fetch(
    HttpMethod.Get,
    `/pets/${id}/visits`
  );
  if (result.status_code != StatusCodes.OK) {
    return Promise.reject(`Could not fetch the visits! An error occured`);
  }
  return result.data;
}
