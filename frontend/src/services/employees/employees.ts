import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import { StatusCodes } from 'http-status-codes';

export type Employee = {
  email: string;
};
export async function getEmployees() {
  const client = new APIClient();
  const result: APIResponse<Employee[]> = await client.fetch(
    HttpMethod.Get,
    '/employees'
  );
  if (result.status_code != StatusCodes.OK) {
    return Promise.reject(`Could not fetch the data! An error occured`);
  }
  return result.data;
}
