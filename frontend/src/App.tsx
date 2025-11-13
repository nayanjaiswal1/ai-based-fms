import { Suspense } from 'react';
import { Routes, Route, Navigate, useRoutes, RouteObject } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
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
 * Recursively wraps route elements with ProtectedPage component
 */
const wrapRouteWithProtection = (route: RouteObject): RouteObject => {
  return {
    ...route,
    element: route.element ? <ProtectedPage>{route.element}</ProtectedPage> : route.element,
    children: route.children?.map(wrapRouteWithProtection),
  };
};

/**
 * Helper component to render nested routes with proper wrapping
 */
const RouteRenderer = ({ route }: { route: RouteObject }) => {
  if (route.children && route.children.length > 0) {
    return (
      <Route path={route.path} element={route.element} index={route.index}>
        {route.children.map((child, index) => (
          <RouteRenderer key={child.path || index} route={child} />
        ))}
      </Route>
    );
  }
  return <Route path={route.path} element={route.element} index={route.index} />;
};

function App() {
  const { isAuthenticated } = useAuthStore();

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
      {wrappedPublicRoutes.map((route, index) => (
        <RouteRenderer key={route.path || `public-${index}`} route={route} />
      ))}

      {/* Protected routes - All lazy loaded with suspense and error boundaries */}
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        {wrappedProtectedRoutes.map((route, index) => (
          <RouteRenderer key={route.path || `protected-${index}`} route={route} />
        ))}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
