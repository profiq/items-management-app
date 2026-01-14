import { useContext } from 'react';
import { AuthContext } from '../../contexts';

export function useAuth() {
  const user = useContext(AuthContext);
  if (!user) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return user;
}
