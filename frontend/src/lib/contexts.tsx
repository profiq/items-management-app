import type { UserInfo } from 'firebase/auth';
import { createContext } from 'react';

// This is dynamically added at runtime by Firebase to UserInfo
export type User = {
  getIdToken?: (forceRefresh?: boolean) => Promise<string>;
} & UserInfo;

export type AuthContextType =
  | {
      loading: true;
      user?: undefined;
      logout?: undefined;
      login?: undefined;
      signingIn: boolean;
    }
  | {
      loading: false;
      user: User;
      logout: () => Promise<void>;
      login?: undefined;
      signingIn?: undefined;
    }
  | {
      loading: false;
      user?: undefined;
      logout?: undefined;
      login: () => Promise<void>;
      signingIn?: boolean;
    };
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
