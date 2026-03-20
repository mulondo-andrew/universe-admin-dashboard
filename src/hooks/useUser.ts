import { useApiClient } from '@/lib/api-client';
import { useAuth, useUser as useClerkUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

export function useUser() {
  const api = useApiClient();
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useClerkUser();

  const { data: user, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await api.get('/users/me');
      return (response as any).data || response;
    },
    enabled: isLoaded && !!isSignedIn,
    retry: false, // Don't retry on 401
  });

  return { user, clerkUser, loading: !isLoaded || loading, error, refetch };
}
