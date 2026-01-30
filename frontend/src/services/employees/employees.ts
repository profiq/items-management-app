import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { StatusCodes } from 'http-status-codes';

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
  if (result.status_code != StatusCodes.OK) {
    return Promise.reject(`Could not fetch the data! An error occured`);
  }
  return result.data;
}
