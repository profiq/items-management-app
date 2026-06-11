import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import { createError } from '@/lib/errors';
import type { User } from '@/lib/contexts';

export type AdminLoanUser = {
  id: number;
  name: string;
  employee_id: string;
};

export type AdminLoanLocation = {
  id: number;
  name: string;
};

export type AdminLoanItem = {
  id: number;
  name: string;
};

export type AdminLoanCopy = {
  id: number;
  item: AdminLoanItem;
  location: AdminLoanLocation;
};

export type AdminLoan = {
  id: number;
  user: AdminLoanUser;
  copy: AdminLoanCopy;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  returned_by_user_id: number | null;
};

export type LoanStatus = 'active' | 'overdue' | 'returned';

export type AdminLoansResponse = {
  data: AdminLoan[];
  total: number;
  page: number;
  limit: number;
};

export type AdminLoansQuery = {
  page: number;
  limit: number;
  status?: LoanStatus;
};

function throwIfFailed<T>(result: APIResponse<T>): T {
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}

function buildQueryString(query: AdminLoansQuery): string {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  if (query.status) {
    params.set('status', query.status);
  }
  return params.toString();
}

export async function getAdminLoans(
  user: User,
  query: AdminLoansQuery
): Promise<AdminLoansResponse> {
  const client = new APIClient(user);
  const result: APIResponse<AdminLoansResponse> = await client.fetch(
    HttpMethod.Get,
    `/admin/loans?${buildQueryString(query)}`
  );
  return throwIfFailed(result);
}

export async function returnAdminLoan(
  user: User,
  id: number
): Promise<AdminLoan> {
  const client = new APIClient(user);
  const result: APIResponse<AdminLoan> = await client.fetch(
    HttpMethod.Put,
    `/admin/loans/${id}/return`
  );
  return throwIfFailed(result);
}

export async function extendAdminLoan(
  user: User,
  id: number,
  dueDays: number
): Promise<AdminLoan> {
  const client = new APIClient(user);
  const result: APIResponse<AdminLoan> = await client.fetch(
    HttpMethod.Put,
    `/admin/loans/${id}/extend`,
    { dueDays }
  );
  return throwIfFailed(result);
}
