import { useAuth } from '@clerk/clerk-react';

export function useClerkToken() {
  const { getToken } = useAuth();
  return async () => getToken();
}
