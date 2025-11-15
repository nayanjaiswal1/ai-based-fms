import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { emailApi } from '@services/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function EmailCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage('Authorization was denied or cancelled');
        setTimeout(() => {
          navigate('/email');
        }, 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received');
        setTimeout(() => {
          navigate('/email');
        }, 3000);
        return;
      }

      try {
        // Exchange code for tokens and create connection
        await emailApi.handleGmailCallback(code);
        setStatus('success');

        // Get return URL from session storage
        const returnUrl = sessionStorage.getItem('emailOAuthReturn') || '/email';
        sessionStorage.removeItem('emailOAuthReturn');

        // Redirect back to email page
        setTimeout(() => {
          navigate(returnUrl);
        }, 2000);
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage(
          error?.response?.data?.message || 'Failed to connect email account'
        );
        setTimeout(() => {
          navigate('/email');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Connecting your email...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we complete the connection
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Successfully Connected!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your Gmail account has been connected. Redirecting...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Connection Failed
            </h2>
            <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
            <p className="mt-1 text-xs text-gray-500">Redirecting back...</p>
          </div>
        )}
      </div>
    </div>
  );
}
