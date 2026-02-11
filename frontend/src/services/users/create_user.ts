import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { StatusCodes } from 'http-status-codes';
import type { UserType } from './users';

export type CreateUserType = {
  name: string;
  workspace_id: string;
};

export async function createUser(data: CreateUserType, user?: User) {
  const client = new APIClient(user);
  const result: APIResponse<UserType> = await client.fetch(
    HttpMethod.Post,
    `/users`,
    data
  );
  if (result.status_code != StatusCodes.CREATED) {
    return Promise.reject(`Could not create the user! An error occured`);
  }
  return result.data;
}
