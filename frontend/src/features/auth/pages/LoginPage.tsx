import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@services/api';
import { API_CONFIG } from '@config/api.config';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { loginFormConfig, LoginFormData } from '../config/authFormConfigs';
import { AlertCircle, Loader2 } from 'lucide-react';
import TwoFactorInput from '@components/2fa/TwoFactorInput';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [emailFor2FA, setEmailFor2FA] = useState('');
  const [passwordFor2FA, setPasswordFor2FA] = useState('');

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data: any) => {
      if (data.require2FA) {
        setShow2FA(true);
        setTempToken(data.tempToken);
      } else if (data?.data?.user || data?.user) {
        const user = data?.data?.user || data?.user;
        setAuth(user);
        navigate('/');
      } else {
        console.error('Login response missing required data:', data);
      }
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
    },
  });

  const login2FAMutation = useMutation({
    mutationFn: authApi.login2FA,
    onSuccess: (data: any) => {
      if (data?.data?.user || data?.user) {
        const user = data?.data?.user || data?.user;
        setAuth(user);
        navigate('/');
      }
    },
  });

  const handleLoginSubmit = async (data: LoginFormData) => {
    setEmailFor2FA(data.email);
    setPasswordFor2FA(data.password);
    await loginMutation.mutateAsync(data);
  };

  const handle2FASubmit = (code: string) => {
    login2FAMutation.mutate({
      email: emailFor2FA,
      password: passwordFor2FA,
      code,
    });
  };

  const handleGoogleLogin = () => {
    const { clientId, redirectUri, scope, authUrl } = API_CONFIG.oauth.google;

    if (!clientId) {
      alert('Google OAuth is not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.');
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      access_type: 'offline',
      prompt: 'consent',
    });

    window.location.href = `${authUrl}?${params.toString()}`;
  };

  if (show2FA) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Two-Factor Authentication
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the code from your authenticator app
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <TwoFactorInput
              length={6}
              onComplete={handle2FASubmit}
              isLoading={login2FAMutation.isPending}
              error={login2FAMutation.isError}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Visual */}
      <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden bg-gradient-to-br from-primary to-primary/80">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.05)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full h-full p-12">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-primary-foreground">FMS</span>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl font-extrabold tracking-tight text-primary-foreground leading-tight">
                Welcome to Your Financial Future
              </h1>
              <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-lg">
                Smart budgeting, intelligent insights, and complete control over your finances—all in one place.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-6 max-w-lg">
              <div className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
                  <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary-foreground">Smart Analytics</h3>
                <p className="text-sm text-primary-foreground/70">AI-powered insights into your spending patterns</p>
              </div>

              <div className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
                  <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary-foreground">Bank-Level Security</h3>
                <p className="text-sm text-primary-foreground/70">Your data is encrypted and always protected</p>
              </div>

              <div className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
                  <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary-foreground">Real-Time Sync</h3>
                <p className="text-sm text-primary-foreground/70">Instant updates across all your devices</p>
              </div>

              <div className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
                  <svg className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary-foreground">Group Budgets</h3>
                <p className="text-sm text-primary-foreground/70">Manage shared expenses with ease</p>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
                <svg className="h-5 w-5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">4.9/5</div>
                <div className="text-xs text-primary-foreground/70 font-medium">User Rating</div>
              </div>
            </div>

            <div className="h-12 w-px bg-primary-foreground/20" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
                <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">10K+</div>
                <div className="text-xs text-primary-foreground/70 font-medium">Active Users</div>
              </div>
            </div>

            <div className="h-12 w-px bg-primary-foreground/20" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
                <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">100%</div>
                <div className="text-xs text-primary-foreground/70 font-medium">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-16 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="space-y-6">
            <ConfigurableForm
              config={loginFormConfig}
              onSubmit={handleLoginSubmit}
              isLoading={loginMutation.isPending}
              submitLabel="Sign in"
              hideButtons
              renderFieldExtra={(field) => {
                if (field.name === 'password') {
                  return (
                    <div className="flex justify-end mt-1.5">
                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  );
                }
                return null;
              }}
            >
              {loginMutation.error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3.5 mb-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive font-medium">Invalid email or password</p>
                  </div>
                </div>
              )}
            </ConfigurableForm>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              onClick={() => {
                const form = document.querySelector('form');
                if (form) {
                  const event = new Event('submit', { cancelable: true, bubbles: true });
                  form.dispatchEvent(event);
                }
              }}
              className="btn-primary w-full"
            >
              {loginMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn-outline w-full"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
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
              Sign in with Google
            </button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
