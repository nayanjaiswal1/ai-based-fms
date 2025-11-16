import axios from 'axios';
import { API_CONFIG } from '@config/api.config';

/**
 * Authentication utility constants
 */
export const AUTH_STORAGE_KEY = 'auth-storage';

/**
 * Endpoint paths that should not trigger token refresh
 */
export const NO_REFRESH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/clear-cookies',
  '/auth/oauth/google',
  '/auth/callback/google',
];

/**
 * Check if a URL should skip token refresh
 */
export const shouldSkipRefresh = (url?: string): boolean => {
  if (!url) return false;
  return NO_REFRESH_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

/**
 * Check if request is to getCurrentUser endpoint
 */
export const isGetCurrentUserRequest = (url?: string): boolean => {
  return url?.includes('/auth/me') ?? false;
};

/**
 * Clear authentication state completely
 * - Clears httpOnly cookies on backend
 * - Clears persisted session storage
 */
export const clearAuthState = async (): Promise<void> => {
  try {
    // Call public clear-cookies endpoint to remove invalid httpOnly cookies
    await axios.post(
      `${API_CONFIG.baseURL}/auth/clear-cookies`,
      {},
      {
        withCredentials: true,
        timeout: 3000, // Short timeout for cleanup
      }
    );
  } catch (error) {
    // Ignore network errors - cookies might already be cleared
    console.debug('Cookie cleanup attempted:', error instanceof Error ? error.message : 'Unknown error');
  } finally {
    // Always clear sessionStorage, even if backend call fails
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (storageError) {
      // In case sessionStorage is not available (e.g., in incognito mode)
      console.debug('SessionStorage cleanup skipped:', storageError);
    }
  }
};

/**
 * Handle authentication failure
 * - Clears auth state
 * - Logs out user from store
 * - Redirects to login page
 */
export const handleAuthFailure = async (
  logout: () => void,
  isAuthenticated: boolean
): Promise<void> => {
  // Clear all auth state
  await clearAuthState();

  // Logout from store if authenticated
  if (isAuthenticated) {
    logout();
  }

  // Redirect to login page
  // Using window.location to ensure complete state reset
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};
