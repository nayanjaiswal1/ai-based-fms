import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_CONFIG } from '@config/api.config';
import { Chrome, CheckCircle, ExternalLink } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function OAuthTab() {
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [isConnecting, setIsConnecting] = useState(false);

  // Mock query for OAuth connections - replace with actual API call
  const { data: connections } = useQuery({
    queryKey: ['oauth-connections'],
    queryFn: async () => {
      // Replace with actual API call
      return { data: [] };
    },
  });

  const handleGoogleLogin = () => {
    const { clientId, redirectUri, scope, authUrl } = API_CONFIG.oauth.google;

    if (!clientId) {
      alert('Google OAuth is not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.');
      return;
    }

    setIsConnecting(true);

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      access_type: 'offline',
      prompt: 'consent',
    });

    const oauthUrl = `${authUrl}?${params.toString()}`;

    // Open OAuth popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      oauthUrl,
      'Google OAuth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for OAuth callback
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        setIsConnecting(false);
        queryClient.invalidateQueries({ queryKey: ['oauth-connections'] });
        window.removeEventListener('message', handleMessage);
        popup?.close();
      } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
        setIsConnecting(false);
        alert('Failed to connect Google account. Please try again.');
        window.removeEventListener('message', handleMessage);
        popup?.close();
      }
    };

    window.addEventListener('message', handleMessage);

    // Handle popup close
    const checkPopup = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkPopup);
        setIsConnecting(false);
        window.removeEventListener('message', handleMessage);
      }
    }, 500);
  };

  const handleDisconnect = async (provider: string) => {
    confirm({
      title: 'Disconnect Account',
      message: `Are you sure you want to disconnect your ${provider} account? You can reconnect it later.`,
      variant: 'warning',
      confirmLabel: 'Disconnect',
      onConfirm: async () => {
        // Implement disconnect logic
        // await api.delete(`/oauth/${provider}`);
        queryClient.invalidateQueries({ queryKey: ['oauth-connections'] });
      },
    });
  };

  const isGoogleConfigured = Boolean(API_CONFIG.oauth.google.clientId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">OAuth Connections</h3>
        <p className="mt-1 text-sm text-gray-600">
          Connect your accounts for seamless authentication
        </p>
      </div>

      {/* Google OAuth */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Chrome className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Google Account</h4>
              <p className="mt-1 text-sm text-gray-600">
                Sign in with your Google account for quick access
              </p>

              {!isGoogleConfigured && (
                <div className="mt-2 rounded-md bg-yellow-50 p-3">
                  <p className="text-sm text-yellow-800">
                    Google OAuth is not configured. Add <code className="font-mono text-xs">VITE_GOOGLE_CLIENT_ID</code> to your environment variables.
                  </p>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-yellow-900 underline"
                  >
                    Get credentials <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {connections?.data?.find((c: any) => c.provider === 'google') ? (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            {connections?.data?.find((c: any) => c.provider === 'google') ? (
              <button
                onClick={() => handleDisconnect('google')}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isConnecting || !isGoogleConfigured}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* OAuth Setup Instructions */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900">Setup Instructions</h4>
        <ol className="mt-2 space-y-1 text-sm text-blue-800">
          <li>1. Create a project in Google Cloud Console</li>
          <li>2. Enable Google+ API</li>
          <li>3. Create OAuth 2.0 credentials</li>
          <li>4. Add authorized redirect URI: <code className="rounded bg-blue-100 px-1 font-mono text-xs">{API_CONFIG.oauth.google.redirectUri}</code></li>
          <li>5. Add Client ID to your <code className="rounded bg-blue-100 px-1 font-mono text-xs">.env</code> file</li>
        </ol>
      </div>

      {/* Benefits */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h4 className="font-semibold text-gray-900">Benefits of OAuth</h4>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>Secure authentication without storing passwords</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>Quick sign-in with one click</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>Automatic profile information sync</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>Enhanced security with 2FA support</span>
          </li>
        </ul>
      </div>

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />
    </div>
  );
}
