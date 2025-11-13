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
      if (data?.data?.requires2FA) {
        setRequires2FA(true);
      } else if (data?.data?.user && data?.data?.accessToken && data?.data?.refreshToken) {
        setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
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
      if (data?.data?.user && data?.data?.accessToken && data?.data?.refreshToken) {
        setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
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
      login2FAMutation.mutate({ email, password, code });
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    login2FAMutation.reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12 transition-colors">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Finance Management System
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {requires2FA ? 'Enter your verification code' : 'Sign in to your account'}
          </p>
        </div>

        {!requires2FA ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
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
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
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
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-ring"
                />
                <div className="mt-2 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            {loginMutation.error && (
              <div className="rounded-md bg-destructive/10 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div className="ml-3">
                    <p className="text-sm text-destructive">Invalid email or password</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:bg-primary/50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                Sign up
              </Link>
            </p>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-primary/10 p-4">
              <p className="text-sm text-primary">
                Two-factor authentication is enabled for this account. Enter the 6-digit code
                from your authenticator app.
              </p>
            </div>

            <div className="space-y-4">
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
              <div className="rounded-md bg-destructive/10 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div className="ml-3">
                    <p className="text-sm text-destructive">
                      Invalid verification code. Please try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                disabled={login2FAMutation.isPending}
                className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:bg-muted disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={() => handle2FASubmit(twoFactorCode)}
                disabled={twoFactorCode.length !== 6 || login2FAMutation.isPending}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed"
              >
                {login2FAMutation.isPending ? 'Verifying...' : 'Verify'}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
