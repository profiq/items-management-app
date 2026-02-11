import { describe, expect, it, vi } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import type { APIResponse } from '@/lib/api_client/api_client';
import { faker } from '@faker-js/faker';
import type { OfficePetType } from './office_pets';
import { getOfficePet } from './office_pet';

describe('Testing getting employees', () => {
  const { mockFetch } = vi.hoisted(() => {
    return { mockFetch: vi.fn() };
  });

  vi.mock(import('@/lib/api_client/api_client'), async importOriginal => {
    const actual = await importOriginal();
    const APIClient = vi.fn(
      class APIClient {
        fetch = mockFetch;
      }
    );
    return {
      ...actual,
      APIClient,
    };
  });

  it('should throw due to getting 403', async () => {
    const id = faker.number.int();
    const name = faker.person.firstName();
    const species = faker.string.alpha();
    const race = faker.string.alpha();
    const data: OfficePetType = { id, name, race, species };
    const result: APIResponse<OfficePetType> = {
      status_code: StatusCodes.FORBIDDEN,
      data,
    };

    mockFetch.mockResolvedValue(result);
    await expect(getOfficePet(id)).rejects.toThrowError();
  });

  it('should return array thanks to getting 200', async () => {
    const id = faker.number.int();
    const name = faker.person.firstName();
    const species = faker.string.alpha();
    const race = faker.string.alpha();

    const data: OfficePetType = { id, name, race, species };
    const result: APIResponse<OfficePetType> = {
      status_code: StatusCodes.OK,
      data,
    };

    mockFetch.mockResolvedValue(result);
    await expect(getOfficePet(id)).resolves.toBe(data);
  });
});
