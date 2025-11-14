import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@services/api';

/**
 * Hook to initialize authentication state on app mount
 * Attempts to restore user session from httpOnly cookie using React Query
 */
export const useAuthInit = () => {
  const { setAuth, setInitialized, isInitialized } = useAuthStore();

  // Use React Query to fetch current user
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: !isInitialized, // Only run if not already initialized
    retry: false, // Don't retry on 401
    staleTime: Infinity, // Keep data fresh
  });

  useEffect(() => {
    // Skip if already initialized or still loading
    if (isInitialized || isLoading) return;

    // Handle successful user fetch
    if (data && !isError) {
      const user = data?.data?.user || data?.user;
      if (user) {
        setAuth(user);
      } else {
        setInitialized(true);
      }
    }

    // Handle error (no session, 401, etc.)
    if (isError) {
      setInitialized(true);
      console.log('No active session found');
    }
  }, [data, error, isError, isLoading, isInitialized, setAuth, setInitialized]);

  return { isInitialized: isInitialized || (!isLoading && (!!data || isError)) };
};
