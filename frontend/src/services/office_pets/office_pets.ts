import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { createError } from '@/lib/errors';

export type OfficePetType = {
  id: number;
  name: string;
  species: string;
  race: string;
  image_url?: string;
};

export async function getOfficePets(user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<OfficePetType[]> = await client.fetch(
    HttpMethod.Get,
    '/pets'
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}
