import {
  APIClient,
  HttpMethod,
  type APIResponse,
} from '@/lib/api_client/api_client';
import { createError } from '@/lib/errors';
import type { User } from '@/lib/contexts';
import type { PublicCategory } from '@/services/items/items';

export type LoanCopyItem = {
  id: number;
  name: string;
  image_url: string | null;
  categories: PublicCategory[];
};

export type LoanCopyLocation = {
  id: number;
  name: string;
};

export type LoanCopy = {
  id: number;
  item: LoanCopyItem;
  location: LoanCopyLocation | null;
};

export type MyLoan = {
  id: number;
  copy: LoanCopy;
  copy_id: number;
  user_id: number;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  returned_by_user_id: number | null;
};

export type LoanStatus = 'active' | 'overdue' | 'returned';

export function getLoanStatus(loan: MyLoan): LoanStatus {
  if (loan.returned_at !== null) return 'returned';
  const today = new Date().toISOString().split('T')[0];
  return loan.due_date < today ? 'overdue' : 'active';
}

function throwIfFailed<T>(result: APIResponse<T>): T {
  if (!result.success) {
    throw createError(result.status_code, result.error.message);
  }
  return result.data;
}

export async function getMyLoans(user: User): Promise<MyLoan[]> {
  const client = new APIClient(user);
  const result: APIResponse<MyLoan[]> = await client.fetch(
    HttpMethod.Get,
    '/loans/my'
  );
  return throwIfFailed(result);
}

export async function returnLoan(user: User, loanId: number): Promise<MyLoan> {
  const client = new APIClient(user);
  const result: APIResponse<MyLoan> = await client.fetch(
    HttpMethod.Put,
    `/loans/${loanId}/return`
  );
  return throwIfFailed(result);
}

export async function borrowItem(user: User, itemId: number): Promise<MyLoan> {
  const client = new APIClient(user);
  const result: APIResponse<MyLoan> = await client.fetch(
    HttpMethod.Post,
    `/loans/borrow-item/${itemId}`
  );
  return throwIfFailed(result);
}
