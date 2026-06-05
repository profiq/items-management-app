import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import { createError } from '@/lib/errors';

export type Category = {
  id: number;
  name: string;
};

export async function getCategories(): Promise<Category[]> {
  const client = new APIClient();
  const result: APIResponse<Category[]> = await client.fetch(
    HttpMethod.Get,
    '/categories'
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}
