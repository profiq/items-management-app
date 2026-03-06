import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { createError } from '@/lib/errors';
import type { PetVisitType } from './pet_visits';

export type VisitCreateType = {
  pet_id: number;
  date: Date;
};

export async function createVisit(data: VisitCreateType, user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<PetVisitType> = await client.fetch(
    HttpMethod.Post,
    '/visits',
    data
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}
