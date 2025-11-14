import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@services/api';
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
