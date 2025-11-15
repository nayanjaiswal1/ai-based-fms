import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@services/api';
import { API_CONFIG } from '@config/api.config';
import TwoFactorInput from '@components/2fa/TwoFactorInput';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data: any) => {
      // Check if 2FA is required
      if (data?.data?.requires2FA || data?.requires2FA) {
        setRequires2FA(true);
      } else if (data?.data?.user || data?.user) {
        // Tokens are now stored in httpOnly cookies, only user data is returned
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
        // Tokens are now stored in httpOnly cookies, only user data is returned
        const user = data?.data?.user || data?.user;
        setAuth(user);
        navigate('/');
      } else {
        console.error('2FA login response missing required data:', data);
      }
    },
    onError: (error: any) => {
      console.error('2FA login failed:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handle2FASubmit = (code: string) => {
    if (code.length === 6) {
      login2FAMutation.mutate({ email, password, twoFactorCode: code });
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    login2FAMutation.reset();
  };

  const handleGoogleLogin = () => {
    const { clientId, redirectUri, scope, authUrl } = API_CONFIG.oauth.google;

    if (!clientId) {
      alert('Google OAuth is not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.');
      return;
    }

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

    // Redirect to Google OAuth
    window.location.href = oauthUrl;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-dawn px-4 py-12 overflow-hidden">
      {/* Atmospheric background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-1/2 h-full bg-primary/10 blur-3xl rounded-full animate-pulse-glow" />
        <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-full bg-accent/10 blur-3xl rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md space-y-8 animate-scale-in">
        <div className="text-center space-y-3 animate-fade-in-down">
          <h2 className="font-serif text-5xl font-bold tracking-tight text-gradient">
            FMS
          </h2>
          <p className="text-lg font-medium text-foreground">Finance Management System</p>
          <p className="text-sm text-muted-foreground">
            {requires2FA ? 'Enter your verification code' : 'Sign in to your account'}
          </p>
        </div>

        {!requires2FA ? (
          <form className="mt-8 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }} onSubmit={handleSubmit}>
            <div className="surface-elevated rounded-xl p-8 space-y-5 backdrop-blur-sm">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border-2 border-border bg-background/50 px-4 py-3 text-foreground backdrop-blur-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-border/80"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border-2 border-border bg-background/50 px-4 py-3 text-foreground backdrop-blur-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-border/80"
                  placeholder="••••••••"
                />
                <div className="mt-3 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            {loginMutation.error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 animate-scale-in">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">Invalid email or password</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative flex w-full justify-center rounded-lg bg-gradient-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-glow-sm transition-all duration-200 hover:shadow-glow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-dawn px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-border bg-background/50 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-200 hover:bg-accent/20 hover:border-border/80 active:scale-95"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        ) : (
          <div className="mt-8 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="surface-elevated rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  Two-factor authentication is enabled for this account. Enter the 6-digit code
                  from your authenticator app.
                </p>
              </div>
            </div>

            <div className="surface-elevated rounded-xl p-8 space-y-6 backdrop-blur-sm">
              <label className="block text-sm font-medium text-foreground text-center">
                Verification Code
              </label>
              <TwoFactorInput
                value={twoFactorCode}
                onChange={setTwoFactorCode}
                onComplete={handle2FASubmit}
                disabled={login2FAMutation.isPending}
              />
            </div>

            {login2FAMutation.error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 animate-scale-in">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">
                    Invalid verification code. Please try again.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                disabled={login2FAMutation.isPending}
                className="flex-1 rounded-lg border-2 border-border bg-background/50 px-5 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-all duration-200 hover:bg-accent/20 hover:border-border/80 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                Back
              </button>
              <button
                onClick={() => handle2FASubmit(twoFactorCode)}
                disabled={twoFactorCode.length !== 6 || login2FAMutation.isPending}
                className="flex-1 rounded-lg bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow-sm transition-all duration-200 hover:shadow-glow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {login2FAMutation.isPending ? 'Verifying...' : 'Verify'}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
