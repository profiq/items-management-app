import type { UserInfo } from 'firebase/auth';
import { createContext } from 'react';

// This is dynamically added at runtime by Firebase to UserInfo
export type User = {
  getIdToken?: (forceRefresh?: boolean) => Promise<string>;
} & UserInfo;

export type UserRole = 'admin' | 'user';

export type AuthContextType =
  | {
      loading: true;
      user?: undefined;
      role?: undefined;
      logout?: undefined;
      login?: undefined;
      signingIn: boolean;
    }
  | {
      loading: false;
      user: User;
      role: UserRole | null;
      logout: () => Promise<void>;
      login?: undefined;
      signingIn?: undefined;
    }
  | {
      loading: false;
      user?: undefined;
      role?: undefined;
      logout?: undefined;
      login: () => Promise<string | undefined>;
      signingIn?: boolean;
    };
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
