import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@stores/authStore';
import { Shield, CheckCircle, XCircle, Info } from 'lucide-react';
import Enable2FAModal from '@components/2fa/Enable2FAModal';
import Disable2FAModal from '@components/2fa/Disable2FAModal';

export default function SecurityTab() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  const is2FAEnabled = user?.twoFactorEnabled || false;

  const handleEnable2FASuccess = () => {
    // Update user state to reflect 2FA is now enabled
    if (user) {
      setUser({ ...user, twoFactorEnabled: true });
    }
    // Invalidate any relevant queries
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  const handleDisable2FASuccess = () => {
    // Update user state to reflect 2FA is now disabled
    if (user) {
      setUser({ ...user, twoFactorEnabled: false });
    }
    // Invalidate any relevant queries
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account security and authentication methods
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${is2FAEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Shield className={`h-6 w-6 ${is2FAEnabled ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Two-Factor Authentication (2FA)</h4>
              <p className="mt-1 text-sm text-gray-600">
                Add an extra layer of security to your account by requiring a verification code
                from your authenticator app when signing in.
              </p>

              <div className="mt-3 flex items-center gap-2">
                {is2FAEnabled ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Disabled</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            {is2FAEnabled ? (
              <button
                onClick={() => setShowDisableModal(true)}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                onClick={() => setShowEnableModal(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Enable 2FA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">About Two-Factor Authentication</h4>
            <p className="mt-1 text-sm text-blue-800">
              Two-factor authentication (2FA) significantly improves your account security by
              requiring both your password and a verification code from your phone to sign in.
              We recommend using apps like Google Authenticator, Authy, or Microsoft Authenticator.
            </p>
          </div>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h4 className="font-semibold text-gray-900">Security Best Practices</h4>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>Enable two-factor authentication for enhanced security</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>Use a strong, unique password for your account</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>Keep your authenticator app backed up and secure</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>Store backup codes in a safe location</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span>Never share your verification codes with anyone</span>
          </li>
        </ul>
      </div>

      {/* Modals */}
      <Enable2FAModal
        isOpen={showEnableModal}
        onClose={() => setShowEnableModal(false)}
        onSuccess={handleEnable2FASuccess}
      />
      <Disable2FAModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onSuccess={handleDisable2FASuccess}
      />
    </div>
  );
}
