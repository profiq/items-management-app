import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import type { OfficePetType } from './office_pets';
import { createError } from '@/lib/errors';

export type OfficePetCreateType = {
  owner_id: string;
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
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}
