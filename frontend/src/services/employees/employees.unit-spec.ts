import { describe, expect, it, vi } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import { type Employee, getEmployees } from './employees';
import type {
  APIResponse,
  ErrorResponseType,
} from '@/lib/api_client/api_client';
import { faker } from '@faker-js/faker';

describe('Testing getting employees', () => {
  const { mockFetch, mockCreateWithImage } = vi.hoisted(() => {
    return { mockFetch: vi.fn(), mockCreateWithImage: vi.fn() };
  });

  vi.mock(import('@/lib/api_client/api_client'), async importOriginal => {
    const actual = await importOriginal();
    const APIClient = vi.fn(
      class APIClient {
        fetch = mockFetch;
        create_with_image = mockCreateWithImage;
      }
    );
    return {
      ...actual,
      APIClient,
    };
  });

  it('should throw due to getting 403', async () => {
    const error: ErrorResponseType = {
      statusCode: StatusCodes.FORBIDDEN,
      error: '',
      message: '',
    };
    const result: APIResponse<Employee[]> = {
      success: false,
      status_code: StatusCodes.FORBIDDEN,
      error,
    };

    mockFetch.mockResolvedValue(result);
    await expect(getEmployees()).rejects.toThrowError();
  });

  it('should return array thanks to getting 200', async () => {
    const email = faker.internet.email();
    const id = faker.string.uuid();
    const name = faker.person.fullName();
    const photoUrl = faker.internet.url();
    const data: Employee[] = [{ email, id, name, photoUrl }];
    const result: APIResponse<Employee[]> = {
      success: true,
      status_code: StatusCodes.OK,
      data: data,
    };

    mockFetch.mockResolvedValue(result);
    await expect(getEmployees()).resolves.toBe(data);
  });
});
