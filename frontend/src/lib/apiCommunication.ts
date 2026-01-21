export type Employee = {
  email: string;
};

import { StatusCodes } from 'http-status-codes';
export type APIResponse<T> = { status_code: StatusCodes; data: T };

export async function getEmployeesFromApi(): Promise<APIResponse<Employee[]>> {
  // TODO, only for testing
  return { status_code: StatusCodes.FORBIDDEN, data: [] };
}
