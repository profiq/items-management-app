import { expect, test, vi } from 'vitest';
import { checkDomain } from './domain';
import type { UserInfo } from 'firebase/auth';
import { faker } from '@faker-js/faker';

vi.mock(import('@/firebase'), () => ({
  auth: undefined,
}));

test('Test checkDomain function', () => {
  const email_valid = faker.internet.email({ provider: 'profiq.com' });
  expect(checkDomain({ email: email_valid } as UserInfo)).toBe(true);
  const email_valid_random_case = faker.internet.email({
    provider: 'proFiQ.Com',
  });
  expect(checkDomain({ email: email_valid_random_case } as UserInfo)).toBe(
    true
  );
  const email_invalid_one_letter = faker.internet.email({
    provider: 'profi.com',
  });
  expect(checkDomain({ email: email_invalid_one_letter } as UserInfo)).toBe(
    false
  );
  const no_domain = faker.string.alphanumeric({ length: { min: 5, max: 20 } });
  expect(checkDomain({ email: no_domain } as UserInfo)).toBe(false);
  expect(checkDomain({ email: 'profiq.com' } as UserInfo)).toBe(false);
  const email_invalid_domain = faker.internet.email();
  expect(checkDomain({ email: email_invalid_domain } as UserInfo)).toBe(false);
});
