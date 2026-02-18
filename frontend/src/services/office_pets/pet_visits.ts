import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import type { PetVisitType } from '@/services/pet_visits/pet_visits';
import { createError } from '@/lib/errors';

export async function getOfficePetVisits(id: number, user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<PetVisitType[]> = await client.fetch(
    HttpMethod.Get,
    `/pets/${id}/visits`
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}
