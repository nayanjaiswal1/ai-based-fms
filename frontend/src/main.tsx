import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/error-boundary';
import { queryClient } from '@config/queryClient';
import { register as registerServiceWorker } from './serviceWorkerRegistration';
import App from './App';
import './styles/index.css';
import './i18n/config';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Register service worker for offline support and caching
registerServiceWorker({
  onSuccess: () => {
    console.log('Service worker registered successfully. Content is cached for offline use.');
  },
  onUpdate: (registration) => {
    console.log('New version available!');
    // You can show a toast/notification here to inform users about the update
    if (window.confirm('New version available! Reload to update?')) {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary level="app">
      <Suspense fallback={<LoadingFallback />}>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ThemeProvider>
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
);
