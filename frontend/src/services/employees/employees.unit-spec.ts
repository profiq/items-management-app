import { describe, expect, it, vi } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import { type Employee, getEmployees } from './employees';
import type { APIResponse } from '@/lib/api_client/api_client';

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
    const result: APIResponse<Employee[]> = {
      status_code: StatusCodes.FORBIDDEN,
      data: [],
    };

    mockFetch.mockResolvedValue(result);
    await expect(getEmployees()).rejects.toThrowError();
  });

  it('should return array thanks to getting 200', async () => {
    const data: Employee[] = [{ email: 'abcd@profiq.com' }];
    const result: APIResponse<Employee[]> = {
      status_code: StatusCodes.OK,
      data: data,
    };

    mockFetch.mockResolvedValue(result);
    await expect(getEmployees()).resolves.toBe(data);
  });
});
