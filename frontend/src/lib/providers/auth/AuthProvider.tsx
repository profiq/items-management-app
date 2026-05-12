import { auth } from '@/firebase';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  AuthContext,
  type AuthContextType,
  type User,
  type UserRole,
} from '@/lib/contexts';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { loginToBackend, getMe, logoutFromBackend } from '@/services/auth/auth';
import { ForbiddenError } from '@/lib/errors';
import { checkDomain, DOMAIN } from './domain';

type AuthProviderProps = {
  children: ReactNode;
};

function toUser(fbUser: FirebaseUser): User {
  return fbUser;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const onUserUpdate = useCallback(async (firebaseUser: FirebaseUser) => {
    if (!checkDomain(firebaseUser)) {
      await auth.signOut();
      return;
    }
    setUser(toUser(firebaseUser));
    try {
      const dbUser = await getMe(toUser(firebaseUser));
      setRole(dbUser.role);
    } catch (err) {
      if (err instanceof ForbiddenError) {
        await auth.signOut();
        return;
      }
      // getMe now upserts on the backend, so any remaining error is unexpected — sign out
      await auth.signOut();
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
          await onUserUpdate(firebaseUser);
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
      const firebaseUser = toUser(result.user);
      setUser(firebaseUser);
      try {
        const dbUser = await loginToBackend(firebaseUser);
        setRole(dbUser.role);
      } catch (err) {
        setRole(null);
        return `Failed to sign in: ${err instanceof Error ? err.message : String(err)}`;
      }
    } catch (err) {
      return `Error during sign in: ${err}`;
    } finally {
      setSigningIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (user) {
        await logoutFromBackend(user);
      }
    } finally {
      await auth.signOut();
      setUser(null);
      setRole(null);
    }
  }, [user]);

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
