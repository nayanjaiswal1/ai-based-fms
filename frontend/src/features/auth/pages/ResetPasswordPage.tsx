import { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@services/api';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { resetPasswordFormConfig, ResetPasswordFormData } from '../config/authFormConfigs';
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState('');

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
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumberOrSpecial: /[\d!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  // Calculate password strength
  const passwordStrength: PasswordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    const validCount = Object.values(passwordValidation).filter(Boolean).length;

    if (validCount === 4 && password.length >= 12) {
      return { score: 100, label: 'Strong', color: 'bg-green-500' };
    } else if (validCount === 4) {
      return { score: 75, label: 'Good', color: 'bg-blue-500' };
    } else if (validCount >= 2) {
      return { score: 50, label: 'Fair', color: 'bg-yellow-500' };
    } else {
      return { score: 25, label: 'Weak', color: 'bg-red-500' };
    }
  }, [password, passwordValidation]);

  const handleSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    await resetPasswordMutation.mutateAsync({ token, password: data.password });
  };

  // Show error if no token
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Invalid Link
            </h2>
            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or has expired
            </p>
          </div>

          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive font-medium">
                Please request a new password reset link.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/forgot-password"
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Request New Link
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground"
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
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-background border-r border-border/50">
        <div className="mx-auto w-full max-w-sm lg:w-96 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Set new password
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSuccess
                ? 'Your password has been successfully reset'
                : 'Create a strong password for your account'}
            </p>
          </div>

          {!isSuccess ? (
            <div className="space-y-6">
              <ConfigurableForm
                config={resetPasswordFormConfig}
                onSubmit={handleSubmit}
                isLoading={resetPasswordMutation.isPending}
                submitLabel="Reset Password"
                renderFieldExtra={(field, form) => {
                  if (field.name === 'password') {
                    // Watch password field to update local state for strength meter
                    const currentPassword = form.watch('password');
                    if (currentPassword !== password) {
                      setPassword(currentPassword || '');
                    }

                    return (
                      <div className="mt-3 space-y-3">
                        {/* Password Strength Indicator */}
                        {password && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Strength</span>
                              <span className={`text-xs font-medium ${passwordStrength.score >= 75 ? 'text-green-600' :
                                  passwordStrength.score >= 50 ? 'text-yellow-600' :
                                    'text-destructive'
                                }`}>
                                {passwordStrength.label}
                              </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                style={{ width: `${passwordStrength.score}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Password Requirements */}
                        {password && (
                          <div className="rounded-lg bg-secondary/50 p-3 space-y-2 border border-border/50">
                            <p className="text-xs font-medium text-muted-foreground">Requirements:</p>
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
                      </div>
                    );
                  }
                  return null;
                }}
              >
                {resetPasswordMutation.error && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 mb-4 animate-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <p className="text-xs text-destructive font-medium">
                        Failed to reset password. The link may be invalid or expired.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </ConfigurableForm>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-foreground">Password Reset Complete</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your password has been successfully updated. You can now use your new password to sign in.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 mix-blend-overlay" />
          <div className="flex h-full items-center justify-center p-12">
            <div className="max-w-lg text-center space-y-8">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl font-serif">
                Account Recovery
              </h1>
              <p className="text-lg text-zinc-400">
                Regain access to your financial dashboard securely.
              </p>

              {/* Abstract Visual Element */}
              <div className="relative mx-auto w-64 h-64 mt-12">
                <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-8 rounded-full border border-white/20 animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full backdrop-blur-xl border border-white/20 flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        <X className="h-3 w-3 mr-2 text-muted-foreground" />
      )}
      <span className={isValid ? 'text-green-600' : 'text-muted-foreground'}>{text}</span>
    </div>
  );
}
