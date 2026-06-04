import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import { createError } from '@/lib/errors';
import type { User } from '@/lib/contexts';

export type AdminCity = {
  id: number;
  name: string;
  archived_at: string | null;
};

export type AdminLocation = {
  id: number;
  name: string;
  city_id: number;
  city: AdminCity;
  archived_at: string | null;
};

export type AdminLocationPayload = {
  name: string;
  city_id: number;
};

export type AdminCityPayload = {
  name: string;
};

function throwIfFailed<T>(result: APIResponse<T>): T {
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}

export async function getAdminLocations(user: User): Promise<AdminLocation[]> {
  const client = new APIClient(user);
  const result: APIResponse<AdminLocation[]> = await client.fetch(
    HttpMethod.Get,
    '/admin/locations'
  );
  return throwIfFailed(result);
}

export async function createAdminLocation(
  user: User,
  payload: AdminLocationPayload
): Promise<AdminLocation> {
  const client = new APIClient(user);
  const result: APIResponse<AdminLocation> = await client.fetch(
    HttpMethod.Post,
    '/admin/locations',
    payload
  );
  return throwIfFailed(result);
}

export async function updateAdminLocation(
  user: User,
  id: number,
  payload: AdminLocationPayload
): Promise<AdminLocation> {
  const client = new APIClient(user);
  const result: APIResponse<AdminLocation> = await client.fetch(
    HttpMethod.Patch,
    `/admin/locations/${id}`,
    payload
  );
  return throwIfFailed(result);
}

export async function archiveAdminLocation(
  user: User,
  id: number
): Promise<void> {
  const client = new APIClient(user);
  const result: APIResponse<void> = await client.fetch(
    HttpMethod.Delete,
    `/admin/locations/${id}`
  );
  return throwIfFailed(result);
}

export async function getAdminCities(user: User): Promise<AdminCity[]> {
  const client = new APIClient(user);
  const result: APIResponse<AdminCity[]> = await client.fetch(
    HttpMethod.Get,
    '/admin/cities'
  );
  return throwIfFailed(result);
}

export async function createAdminCity(
  user: User,
  payload: AdminCityPayload
): Promise<AdminCity> {
  const client = new APIClient(user);
  const result: APIResponse<AdminCity> = await client.fetch(
    HttpMethod.Post,
    '/admin/cities',
    payload
  );
  return throwIfFailed(result);
}

export async function updateAdminCity(
  user: User,
  id: number,
  payload: AdminCityPayload
): Promise<AdminCity> {
  const client = new APIClient(user);
  const result: APIResponse<AdminCity> = await client.fetch(
    HttpMethod.Patch,
    `/admin/cities/${id}`,
    payload
  );
  return throwIfFailed(result);
}

export async function archiveAdminCity(user: User, id: number): Promise<void> {
  const client = new APIClient(user);
  const result: APIResponse<void> = await client.fetch(
    HttpMethod.Delete,
    `/admin/cities/${id}`
  );
  return throwIfFailed(result);
}
