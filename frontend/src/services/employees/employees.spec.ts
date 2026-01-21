import { describe, expect, it, vi } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import { type APIResponse, type Employee } from '@/lib/apiCommunication';
import { getEmployees } from './employees';

describe('Testing getting employees', () => {
  const { mockGetEmployeesFromApi } = vi.hoisted(() => {
    return { mockGetEmployeesFromApi: vi.fn() };
  });

  vi.mock('@/lib/apiCommunication', () => {
    return { getEmployeesFromApi: mockGetEmployeesFromApi };
  });

  it('should throw due to getting 403', async () => {
    const result: APIResponse<Employee[]> = {
      status_code: StatusCodes.FORBIDDEN,
      data: [],
    };

    mockGetEmployeesFromApi.mockResolvedValue(result);
    await expect(getEmployees()).rejects.toThrowError();
  });

  it('should return array thanks to getting 200', async () => {
    const data: Employee[] = [{ email: 'abcd@profiq.com' }];
    const result: APIResponse<Employee[]> = {
      status_code: StatusCodes.OK,
      data: data,
    };

    mockGetEmployeesFromApi.mockResolvedValue(result);
    await expect(getEmployees()).resolves.toBe(data);
  });
});
