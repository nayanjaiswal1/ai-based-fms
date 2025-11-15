import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@services/api';
import { Loader, AlertCircle } from 'lucide-react';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Check if backend already handled the OAuth (success/error params)
      const success = searchParams.get('success');
      const backendError = searchParams.get('error');

      if (success === 'true') {
        // Backend already handled OAuth, just redirect
        navigate('/', { replace: true });
        return;
      }

      if (backendError) {
        setError(backendError);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      // Otherwise, handle OAuth code ourselves
      const code = searchParams.get('code');

      if (!code) {
        setError('No authorization code received from Google');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
        return;
      }

      try {
        // Call backend API to exchange code for tokens
        const response = await authApi.googleOAuth(code);
        const user = response?.data?.user || response?.user;

        if (user) {
          // Tokens are stored in httpOnly cookies by the backend
          setAuth(user);
          navigate('/', { replace: true });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err: any) {
        console.error('Google OAuth error:', err);
        setError(err.response?.data?.message || 'Failed to authenticate with Google');
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dawn px-4">
      <div className="text-center">
        {error ? (
          <div className="rounded-lg bg-red-50 p-6">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
            <p className="mt-4 text-lg font-semibold text-red-900">Authentication Failed</p>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <p className="mt-4 text-xs text-red-600">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <Loader className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-lg text-gray-900 font-semibold">Completing Google Sign In...</p>
            <p className="mt-2 text-sm text-gray-600">Please wait while we verify your account</p>
          </>
        )}
      </div>
    </div>
  );
}
