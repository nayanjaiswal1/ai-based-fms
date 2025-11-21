import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@stores/authStore';
import { authApi } from '@services/api';
import { API_CONFIG } from '@config/api.config';
import { ConfigurableForm } from '@components/form/ConfigurableForm';
import { registerFormConfig, RegisterFormData } from '../config/authFormConfigs';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data: any) => {
      if (data?.data?.user || data?.user) {
        const user = data?.data?.user || data?.user;
        setAuth(user);
        navigate('/');
      } else {
        console.error('Registration response missing required data:', data);
      }
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
    },
  });

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    await registerMutation.mutateAsync(registerData);
  };

  const handleGoogleSignup = () => {
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-background border-r border-border/50">
        <div className="mx-auto w-full max-w-sm lg:w-96 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Create an account
            </h2>
            <p className="text-sm text-muted-foreground">
              Start managing your finances today
            </p>
          </div>

          <div className="space-y-6">
            <ConfigurableForm
              config={registerFormConfig}
              onSubmit={handleRegisterSubmit}
              isLoading={registerMutation.isPending}
              submitLabel="Create account"
            >
              {registerMutation.error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 mb-4 animate-in slide-in-from-top-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <p className="text-xs text-destructive font-medium">Registration failed. Please try again.</p>
                  </div>
                </div>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card hover:bg-accent/50 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 active:scale-[0.98]"
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
                Google
              </button>
            </ConfigurableForm>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 to-accent/20 mix-blend-overlay" />
          <div className="flex h-full items-center justify-center p-12">
            <div className="max-w-lg text-center space-y-8">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl font-serif">
                Join FMS Today
              </h1>
              <p className="text-lg text-zinc-400">
                Experience the next generation of financial management. Simple, powerful, and secure.
              </p>

              {/* Abstract Visual Element */}
              <div className="relative mx-auto w-64 h-64 mt-12">
                <div className="absolute inset-0 rotate-45 border border-white/10 animate-[spin_15s_linear_infinite]" />
                <div className="absolute inset-8 -rotate-45 border border-white/20 animate-[spin_20s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-tr from-accent to-primary rounded-full blur-3xl opacity-20 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
