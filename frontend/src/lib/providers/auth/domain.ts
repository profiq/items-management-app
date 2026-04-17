import type { UserInfo } from 'firebase/auth';

export const DOMAIN = 'profiq.com';

export const checkDomain = (user: UserInfo): boolean => {
  const { email } = user;
  const domain = email?.split('@')[1];
  return domain?.toLowerCase() === DOMAIN;
};
