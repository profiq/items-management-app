import { auth } from '@/firebase';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  type UserInfo,
} from 'firebase/auth';
import {
  AuthContext,
  type AuthContextType,
  type User,
  type UserRole,
} from '@/lib/contexts';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { loginToBackend, getMe } from '@/services/auth/auth';
import { ForbiddenError } from '@/lib/errors';

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
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const onUserUpdate = useCallback(async (firebaseUser: User) => {
    if (!checkDomain(firebaseUser)) {
      auth.signOut();
      return;
    }
    setUser(firebaseUser);
    try {
      const dbUser = await getMe(firebaseUser);
      setRole(dbUser.role);
    } catch (err) {
      if (err instanceof ForbiddenError) {
        auth.signOut();
        return;
      }
      // User not in DB yet — will be created on next login
      setRole(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    let destroyed = false;
    let unsubscribe: (() => void) | undefined;
    (async () => {
      await setPersistence(auth, browserLocalPersistence);
      unsubscribe = auth.onAuthStateChanged(async firebaseUser => {
        if (firebaseUser) {
          await onUserUpdate(firebaseUser as User);
        } else {
          setUser(null);
          setRole(null);
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

  const login = useCallback(async (): Promise<string | undefined> => {
    try {
      setSigningIn(true);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ hd: DOMAIN });

      const result = await signInWithPopup(auth, provider);
      if (!result.user) {
        return 'Failed to login. Try again.';
      }
      if (!checkDomain(result.user)) {
        return `User does not belong to ${DOMAIN}.`;
      }
      const firebaseUser = result.user as User;
      setUser(firebaseUser);
      try {
        const dbUser = await loginToBackend(firebaseUser);
        setRole(dbUser.role);
      } catch {
        setRole(null);
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
    setRole(null);
  }, []);

  return (
    <AuthContext
      value={
        {
          loading,
          user,
          role,
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
