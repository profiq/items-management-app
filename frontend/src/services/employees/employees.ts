import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { createError } from '@/lib/errors';

export type Employee = {
  id: string;
  email: string;
  name: string;
  photoUrl: string;
};
export async function getEmployees(user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<Employee[]> = await client.fetch(
    HttpMethod.Get,
    '/employees'
  );
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}
