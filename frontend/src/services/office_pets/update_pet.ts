import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import type { OfficePetType } from './office_pets';
import { createError } from '@/lib/errors';

export type OfficePetUpdateType = {
  owner_id: string;
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
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}
