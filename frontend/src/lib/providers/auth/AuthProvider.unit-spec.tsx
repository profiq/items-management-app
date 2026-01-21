import { expect, test, vi } from 'vitest';
import { checkDomain } from './AuthProvider';
import type { UserInfo } from 'firebase/auth';

vi.mock(import('@/firebase'), () => ({
  auth: null,
}));

test('Test checkDomain function', () => {
  expect(checkDomain({ email: 'abcd@profiq.com' } as UserInfo)).toBe(true);
  expect(checkDomain({ email: 'abcd@ProFiq.com' } as UserInfo)).toBe(true);
  expect(checkDomain({ email: 'abcd@profi.com' } as UserInfo)).toBe(false);
  expect(checkDomain({ email: 'abcd' } as UserInfo)).toBe(false);
  expect(checkDomain({ email: 'profiq.com' } as UserInfo)).toBe(false);
  expect(checkDomain({ email: 'profiq.com@profig.com' } as UserInfo)).toBe(
    false
  );
});
