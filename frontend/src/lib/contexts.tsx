import type { UserInfo } from 'firebase/auth';
import { createContext } from 'react';

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
      user: UserInfo;
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
