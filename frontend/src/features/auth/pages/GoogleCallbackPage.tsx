import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { Loader } from 'lucide-react';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      // Tokens are now stored in httpOnly cookies by the backend
      // We need to fetch user info to populate the auth store
      // For now, set a temporary auth state and let the app fetch user info
      // The app should have a mechanism to fetch current user on mount

      // Send success message to opener window (if opened in popup)
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_OAUTH_SUCCESS' },
          window.location.origin
        );
        window.close();
      } else {
        // If not in popup, redirect to dashboard
        // The dashboard will fetch user info on mount
        navigate('/', { replace: true });
      }
    } else {
      // Send error message to opener window
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_OAUTH_ERROR', error: error || 'Authentication failed' },
          window.location.origin
        );
        window.close();
      } else {
        // If not in popup, redirect to login with error
        navigate('/login', {
          replace: true,
          state: { error: error || 'Authentication failed' },
        });
      }
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader className="mx-auto h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
