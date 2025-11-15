import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { emailApi } from '@services/api';
import Modal from '@components/ui/Modal';
import { Mail } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailModal({ isOpen, onClose }: EmailModalProps) {
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      // Get the OAuth URL from backend
      const response = await emailApi.getGmailAuthUrl();

      // Store the current page info to redirect back after OAuth
      sessionStorage.setItem('emailOAuthReturn', window.location.pathname);

      // Redirect to Google OAuth consent page
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to initiate Google OAuth:', error);
      setIsConnecting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Email Account"
      description="Connect your email to automatically import transactions from receipts and confirmations"
      size="md"
    >
      <div className="space-y-4 py-4">
        {/* Google OAuth Button */}
        <button
          onClick={handleConnectGoogle}
          disabled={isConnecting}
          className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-white px-6 py-4 text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-medium">
            {isConnecting ? 'Connecting...' : 'Connect with Google'}
          </span>
        </button>

        {/* Info Text */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex gap-3">
            <Mail className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">Secure OAuth Connection</p>
              <p className="mt-1 text-blue-800">
                We'll securely access your Gmail inbox to scan for transaction receipts.
                You can revoke access at any time from your Google account settings.
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">Coming Soon</p>
          <div className="space-y-2 opacity-50">
            <button
              disabled
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-gray-100 px-6 py-4 text-gray-500"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#0078D4">
                <path d="M23.15 2.587L18.104.513a1.75 1.75 0 00-1.296 0L11.858 2.35 6.91.513a1.75 1.75 0 00-1.296 0L.563 2.587A1.75 1.75 0 000 4.136v15.363a1.75 1.75 0 001.049 1.605l5.052 2.074a1.75 1.75 0 001.296 0l4.95-1.837 4.95 1.837a1.75 1.75 0 001.296 0l5.052-2.074A1.75 1.75 0 0024 19.499V4.136a1.75 1.75 0 00-1.049-1.549z" />
              </svg>
              <span className="font-medium">Connect with Outlook</span>
            </button>
            <button
              disabled
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-gray-100 px-6 py-4 text-gray-500"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#6001D2">
                <path d="M22.177 6.815H1.823A1.823 1.823 0 000 8.638v6.724a1.823 1.823 0 001.823 1.823h20.354A1.823 1.823 0 0024 15.362V8.638a1.823 1.823 0 00-1.823-1.823zm-19.93 9.018l4.087-3.986-4.087-3.986V7.639l5.634 5.493-5.634 5.494v-2.793zm19.506 0l-4.087-3.986 4.087-3.986V7.639l-5.634 5.493 5.634 5.494v-2.793z" />
              </svg>
              <span className="font-medium">Connect with Yahoo</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
