import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import Modal from '@components/ui/Modal';
import TwoFactorInput from './TwoFactorInput';
import { authApi } from '@services/api';
import { CheckCircle, Copy, Download, AlertCircle } from 'lucide-react';

interface Enable2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Enable2FAResponse {
  qrCode: string;
  secret: string;
}

interface Verify2FAResponse {
  backupCodes: string[];
}

export default function Enable2FAModal({ isOpen, onClose, onSuccess }: Enable2FAModalProps) {
  const [step, setStep] = useState<'qr' | 'backup'>('qr');
  const [code, setCode] = useState('');
  const [qrData, setQrData] = useState<Enable2FAResponse | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('qr');
      setCode('');
      setQrData(null);
      setBackupCodes([]);
      setCopied(false);
    }
  }, [isOpen]);

  // Enable 2FA mutation
  const enableMutation = useMutation({
    mutationFn: authApi.enable2FA,
    onSuccess: (data: any) => {
      setQrData(data.data);
    },
  });

  // Verify setup mutation
  const verifyMutation = useMutation({
    mutationFn: (code: string) => authApi.verify2FASetup(code),
    onSuccess: (data: any) => {
      setBackupCodes(data.data.backupCodes);
      setStep('backup');
    },
  });

  // Load QR code when modal opens
  useEffect(() => {
    if (isOpen && !qrData) {
      enableMutation.mutate();
    }
  }, [isOpen]);

  const handleVerify = () => {
    if (code.length === 6) {
      verifyMutation.mutate(code);
    }
  };

  const handleCopySecret = () => {
    if (qrData?.secret) {
      navigator.clipboard.writeText(qrData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enable Two-Factor Authentication" maxWidth="xl">
      {step === 'qr' && (
        <div className="space-y-6">
          {enableMutation.isPending ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : enableMutation.error ? (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    Failed to generate 2FA setup. Please try again.
                  </p>
                </div>
              </div>
            </div>
          ) : qrData ? (
            <>
              <div className="text-sm text-gray-600">
                <p className="mb-4">
                  Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center rounded-lg bg-white p-4">
                <img src={qrData.qrCode} alt="2FA QR Code" className="h-64 w-64" />
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter this key manually:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={qrData.secret}
                    readOnly
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-sm bg-gray-50"
                  />
                  <button
                    onClick={handleCopySecret}
                    className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Verification Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Enter the 6-digit code from your authenticator app:
                </label>
                <TwoFactorInput
                  value={code}
                  onChange={setCode}
                  onComplete={handleVerify}
                  disabled={verifyMutation.isPending}
                />
              </div>

              {verifyMutation.error && (
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
                  className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify}
                  disabled={code.length !== 6 || verifyMutation.isPending}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {verifyMutation.isPending ? 'Verifying...' : 'Verify and Enable'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}

      {step === 'backup' && (
        <div className="space-y-6">
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Two-Factor Authentication enabled successfully!
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Save these backup codes in a secure location. You can use them to access your account
              if you lose access to your authenticator app.
            </p>
            <p className="font-medium text-amber-600">
              Each backup code can only be used once.
            </p>
          </div>

          {/* Backup Codes */}
          <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="rounded bg-white px-3 py-2 text-center">
                  {code}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCopyBackupCodes}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Codes'}
            </button>
            <button
              onClick={handleDownloadBackupCodes}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>

          <button
            onClick={handleComplete}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}
