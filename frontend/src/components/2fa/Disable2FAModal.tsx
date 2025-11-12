import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import Modal from '@components/ui/Modal';
import TwoFactorInput from './TwoFactorInput';
import { authApi } from '@services/api';
import { AlertTriangle, AlertCircle } from 'lucide-react';

interface Disable2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function Disable2FAModal({ isOpen, onClose, onSuccess }: Disable2FAModalProps) {
  const [code, setCode] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCode('');
    }
  }, [isOpen]);

  const disableMutation = useMutation({
    mutationFn: (code: string) => authApi.disable2FA(code),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const handleDisable = () => {
    if (code.length === 6) {
      disableMutation.mutate(code);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Disable Two-Factor Authentication" maxWidth="md">
      <div className="space-y-6">
        {/* Warning Message */}
        <div className="rounded-md bg-amber-50 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">Warning</h3>
              <p className="mt-1 text-sm text-amber-700">
                Disabling two-factor authentication will make your account less secure. You will
                only need your password to log in.
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            To confirm you want to disable two-factor authentication, please enter the 6-digit
            code from your authenticator app:
          </p>
        </div>

        {/* Verification Code Input */}
        <div>
          <TwoFactorInput
            value={code}
            onChange={setCode}
            onComplete={handleDisable}
            disabled={disableMutation.isPending}
          />
        </div>

        {/* Error Message */}
        {disableMutation.error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  Invalid verification code. Please try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={disableMutation.isPending}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDisable}
            disabled={code.length !== 6 || disableMutation.isPending}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-red-300"
          >
            {disableMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
