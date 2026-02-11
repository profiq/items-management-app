import { auth } from '@/firebase';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  type UserInfo,
} from 'firebase/auth';
import { AuthContext, type AuthContextType, type User } from '@/lib/contexts';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createUser, type CreateUserType } from '@/services/users/create_user';

const DOMAIN = 'profiq.com';

export const checkDomain = (user: UserInfo): boolean => {
  const { email } = user;
  const domain = email?.split('@')[1];
  return domain?.toLowerCase() === DOMAIN;
};

type UserCreationAuthType = {
  data: CreateUserType;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const createUserMutation = useMutation({
    mutationKey: ['user-create'],
    mutationFn: async ({ data, user }: UserCreationAuthType) =>
      createUser(data, user),
  });

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
      // result.user.uid contains uid of the user in the firebase project.
      // To find the google workspace uid, we need to use this thing.
      const workspace_id =
        result.user.providerData.find(
          element => element.providerId == 'google.com'
        )?.uid ?? '';
      const data: UserCreationAuthType = {
        data: {
          workspace_id,
          name: result.user.displayName ?? '',
        },
        user: result.user,
      };
      createUserMutation.mutate(data);
    } catch (err) {
      return `Error during sign in: ${err}`;
    } finally {
      setSigningIn(false);
    }
  }, [createUserMutation]);

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
