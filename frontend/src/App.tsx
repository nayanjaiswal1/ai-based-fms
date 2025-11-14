import { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, RouteObject } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import { useSubscriptionSync } from '@/hooks/useSubscriptionSync';
import { useAuthInit } from '@/hooks/useAuthInit';
import { ErrorBoundary } from '@/components/error-boundary';
import Layout from '@components/layout/Layout';
import { protectedRoutes, publicRoutes } from '@config/routes.config';

// Eager load critical auth pages (no code splitting for auth flow)
import LoginPage from '@features/auth/pages/LoginPage';
import RegisterPage from '@features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@features/auth/pages/ResetPasswordPage';
import GoogleCallbackPage from '@features/auth/pages/GoogleCallbackPage';

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Helper component to wrap pages with ErrorBoundary and Suspense
const ProtectedPage = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary level="page">
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

/**
 * Component to initialize subscription data for authenticated users
 * Syncs subscription and usage data from backend on mount and periodically
 */
const SubscriptionInitializer = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useSubscriptionSync();

  // Show loading state while initial subscription data is being fetched
  if (isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
};

/**
 * Recursively wraps route elements with ProtectedPage component
 */
const wrapRouteWithProtection = (route: RouteObject): RouteObject => {
  const wrappedRoute: RouteObject = {
    path: route.path,
    index: route.index,
    element: route.element ? <ProtectedPage>{route.element}</ProtectedPage> : route.element,
  };

  if (route.children) {
    wrappedRoute.children = route.children.map(wrapRouteWithProtection);
  }

  return wrappedRoute;
};

function App() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Initialize auth state from httpOnly cookie on app mount
  useAuthInit();

  // Show loading state while checking for existing session
  if (!isInitialized) {
    return <PageLoader />;
  }

  // Wrap all protected routes with error boundaries and suspense
  const wrappedProtectedRoutes = protectedRoutes.map(wrapRouteWithProtection);
  const wrappedPublicRoutes = publicRoutes.map(wrapRouteWithProtection);

  return (
    <Routes>
      {/* Public auth routes - No lazy loading for auth flows */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" />} />
      <Route path="/reset-password" element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" />} />
      <Route path="/auth/callback/google" element={<GoogleCallbackPage />} />

      {/* Public routes from config */}
      {wrappedPublicRoutes.map((route, index) => {
        const key = route.path || `public-${index}`;
        if (route.children) {
          return (
            <Route key={key} path={route.path} element={route.element}>
              {route.children.map((child, childIndex) => (
                <Route
                  key={child.path || `child-${childIndex}`}
                  path={child.path}
                  index={child.index}
                  element={child.element}
                />
              ))}
            </Route>
          );
        }
        return <Route key={key} path={route.path} index={route.index} element={route.element} />;
      })}

      {/* Protected routes - All lazy loaded with suspense and error boundaries */}
      <Route element={isAuthenticated ? (
        <SubscriptionInitializer>
          <Layout />
        </SubscriptionInitializer>
      ) : <Navigate to="/login" />}>
        {wrappedProtectedRoutes.map((route, index) => {
          const key = route.path || `protected-${index}`;
          if (route.children) {
            return (
              <Route key={key} path={route.path} element={route.element}>
                {route.children.map((child, childIndex) => (
                  <Route
                    key={child.path || `child-${childIndex}`}
                    path={child.path}
                    index={child.index}
                    element={child.element}
                  />
                ))}
              </Route>
            );
          }
          return <Route key={key} path={route.path} index={route.index} element={route.element} />;
        })}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
