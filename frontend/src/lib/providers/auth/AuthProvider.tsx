import { auth } from '@/firebase';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  type UserInfo,
} from 'firebase/auth';
import { AuthContext, type AuthContextType } from '@/lib/contexts';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

const DOMAIN = 'profiq.com';

export const checkDomain = (user: UserInfo): boolean => {
  const { email } = user;
  const domain = email?.split('@')[1];
  return domain?.toLowerCase() === DOMAIN;
};

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const onUserUpdate = useCallback(async (user: UserInfo) => {
    if (!checkDomain(user)) {
      auth.signOut();
      return;
    }
    setUser(user);
  }, []);

  useEffect(() => {
    setLoading(true);
    let destroyed = false;
    let unsubscribe: (() => void) | undefined;
    (async () => {
      await setPersistence(auth, browserLocalPersistence);
      unsubscribe = auth.onAuthStateChanged(async user => {
        if (user) {
          await onUserUpdate(user);
        } else {
          setUser(null);
        }

        setLoading(false);
      });
      if (destroyed) {
        unsubscribe();
      }
    })();
    return () => {
      unsubscribe?.();
      destroyed = true;
    };
  }, [onUserUpdate]);

  const login = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Provide domain hint to the user
      provider.setCustomParameters({
        hd: DOMAIN,
      });

      const result = await signInWithPopup(auth, provider);
      if (!result.user) {
        return 'Failed to login. Try again.';
      }

      if (!checkDomain(result.user)) {
        return `User does not belong to ${DOMAIN}.`;
      }
    } catch (err) {
      return `Error during sign in: ${err}`;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await auth.signOut();
    setUser(null);
  }, []);
  return (
    <AuthContext
      value={
        {
          loading,
          user,
          logout,
          login,
          signingIn,
        } as unknown as AuthContextType
      }
    >
      {children}
    </AuthContext>
  );
}
