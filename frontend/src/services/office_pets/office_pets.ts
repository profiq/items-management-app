import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { StatusCodes } from 'http-status-codes';

export type OfficePetType = {
  id: number;
  name: string;
  species: string;
  race: string;
};

export async function getOfficePets(user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<OfficePetType[]> = await client.fetch(
    HttpMethod.Get,
    '/pets'
  );
  if (result.status_code != StatusCodes.OK) {
    return Promise.reject(`Could not fetch the data! An error occured`);
  }
  return result.data;
}
