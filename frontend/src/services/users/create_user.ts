import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import type { User } from '@/lib/contexts';
import { StatusCodes } from 'http-status-codes';
import type { UserType } from './users';
import { createError, type MessageOverride } from '@/lib/errors';

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
    const overrides: MessageOverride[] = [
      {
        status_code: StatusCodes.NOT_FOUND,
        message: 'The specified pet was not found',
      },
    ];
    throw createError(result.status_code, overrides);
  }
  return result.data;
}
