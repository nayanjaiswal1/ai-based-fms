import { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@services/api';
import { AlertCircle, CheckCircle, ArrowLeft, Check, X } from 'lucide-react';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      setIsSuccess(true);
    },
  });

  // Password validation rules
  const passwordValidation = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumberOrSpecial: /[\d!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };
  }, [newPassword]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // Calculate password strength
  const passwordStrength: PasswordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: '' };

    const validCount = Object.values(passwordValidation).filter(Boolean).length;

    if (validCount === 4 && newPassword.length >= 12) {
      return { score: 100, label: 'Strong', color: 'bg-green-500' };
    } else if (validCount === 4) {
      return { score: 75, label: 'Good', color: 'bg-blue-500' };
    } else if (validCount >= 2) {
      return { score: 50, label: 'Fair', color: 'bg-yellow-500' };
    } else {
      return { score: 25, label: 'Weak', color: 'bg-red-500' };
    }
  }, [newPassword, passwordValidation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      return;
    }

    if (!isPasswordValid) {
      return;
    }

    if (!passwordsMatch) {
      return;
    }

    resetPasswordMutation.mutate({ token, password: newPassword });
  };

  // Show error if no token
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This password reset link is invalid or has expired
            </p>
          </div>

          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  Please request a new password reset link.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/forgot-password"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              Request New Link
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Set new password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSuccess
              ? 'Your password has been successfully reset'
              : 'Enter your new password below'}
          </p>
        </div>

        {!isSuccess ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password strength:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score >= 75 ? 'text-green-600' :
                        passwordStrength.score >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <div className="rounded-md bg-gray-50 p-4 space-y-2">
                  <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                  <div className="space-y-1">
                    <ValidationItem
                      isValid={passwordValidation.minLength}
                      text="At least 8 characters"
                    />
                    <ValidationItem
                      isValid={passwordValidation.hasUppercase}
                      text="One uppercase letter"
                    />
                    <ValidationItem
                      isValid={passwordValidation.hasLowercase}
                      text="One lowercase letter"
                    />
                    <ValidationItem
                      isValid={passwordValidation.hasNumberOrSpecial}
                      text="One number or special character"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
                {confirmPassword && passwordsMatch && (
                  <p className="mt-1 text-xs text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>
            </div>

            {resetPasswordMutation.error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">
                      Failed to reset password. The link may be invalid or expired.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={
                resetPasswordMutation.isPending ||
                !isPasswordValid ||
                !passwordsMatch
              }
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/login"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for validation items
function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div className="flex items-center text-xs">
      {isValid ? (
        <Check className="h-3 w-3 mr-2 text-green-600" />
      ) : (
        <X className="h-3 w-3 mr-2 text-gray-400" />
      )}
      <span className={isValid ? 'text-green-700' : 'text-gray-600'}>{text}</span>
    </div>
  );
}
