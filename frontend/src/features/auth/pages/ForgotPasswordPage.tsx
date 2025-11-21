import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@services/api';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { forgotPasswordFormConfig, ForgotPasswordFormData } from '../config/authFormConfigs';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resetRequestMutation = useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onSuccess: () => {
      setIsSubmitted(true);
    },
  });

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    await resetRequestMutation.mutateAsync(data.email);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-background border-r border-border/50">
        <div className="mx-auto w-full max-w-sm lg:w-96 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Reset password
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSubmitted
                ? 'Check your email for reset instructions'
                : 'Enter your email address and we will send you a reset link'}
            </p>
          </div>

          {!isSubmitted ? (
            <div className="space-y-6">
              <ConfigurableForm
                config={forgotPasswordFormConfig}
                onSubmit={handleSubmit}
                isLoading={resetRequestMutation.isPending}
                submitLabel="Send Reset Link"
              >
                {resetRequestMutation.error && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 mb-4 animate-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <p className="text-xs text-destructive font-medium">
                        Failed to send reset link. Please try again.
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
                    <h3 className="font-medium text-foreground">Check your email</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      If an account with that email exists, a password reset link has been sent.
                      Please check your inbox and spam folder.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    resetRequestMutation.reset();
                  }}
                  className="w-full rounded-md border border-border bg-card hover:bg-accent/50 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 active:scale-[0.98]"
                >
                  Try another email
                </button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </div>
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
                Secure by Design
              </h1>
              <p className="text-lg text-zinc-400">
                We use industry-standard encryption to keep your financial data safe and secure.
              </p>

              {/* Abstract Visual Element */}
              <div className="relative mx-auto w-64 h-64 mt-12">
                <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse" />
                <div className="absolute inset-12 rounded-full border border-white/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white/5 rounded-full backdrop-blur-xl border border-white/10 flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary rounded-full opacity-80 blur-xl" />
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
