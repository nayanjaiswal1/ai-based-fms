import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { gdprApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleClose = () => {
    if (isDeleting) return;
    setStep(1);
    setPassword('');
    setConfirmText('');
    onClose();
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setIsDeleting(true);

    try {
      await gdprApi.deleteAccount(password);

      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();

      // Logout
      logout();

      // Redirect to goodbye page
      navigate('/goodbye', { replace: true });

      toast.success('Account successfully deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        {/* Close button */}
        {!isDeleting && (
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Delete Account</h2>
        </div>

        {/* Step 1: Warning */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-900">
                Warning: This action is permanent and cannot be undone!
              </h3>
              <p className="text-sm text-red-800">
                All your data will be permanently deleted, including:
              </p>
            </div>

            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <span className="text-red-500">✗</span>
                <span>All your transactions and financial records</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-500">✗</span>
                <span>All your accounts and balances</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-500">✗</span>
                <span>All your budgets and financial goals</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-500">✗</span>
                <span>All your investments and portfolio data</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-500">✗</span>
                <span>Your membership in all groups (you'll be removed)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-500">✗</span>
                <span>All your personal data and preferences</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-500">✗</span>
                <span>All your custom categories and tags</span>
              </li>
            </ul>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Password Confirmation */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Please enter your password to confirm account deletion:
            </p>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter your password"
                disabled={isDeleting}
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setStep(1)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!password || isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-900">Final Step</h3>
              <p className="text-sm text-red-800">
                To confirm deletion, please type <strong>DELETE</strong> in the box below:
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="DELETE"
                disabled={isDeleting}
              />
            </div>

            <div className="rounded-lg bg-yellow-50 p-3">
              <p className="text-xs text-yellow-800">
                After deletion, you can create a new account if you change your mind, but your
                previous data cannot be recovered.
              </p>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setStep(2)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE' || isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
