import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/error-boundary';
import { queryClient } from '@config/queryClient';
import { register as registerServiceWorker } from './serviceWorkerRegistration';
import { toast, Toaster } from 'react-hot-toast';
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
    // Show toast notification for app update
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <span className="font-semibold">New version available!</span>
          <span className="text-sm text-gray-600">Click to reload and update the app.</span>
          <button
            onClick={() => {
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
              toast.dismiss(t.id);
            }}
            className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Reload Now
          </button>
        </div>
      ),
      {
        duration: Infinity,
        position: 'bottom-right',
      }
    );
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
      <Toaster />
    </ErrorBoundary>
  </React.StrictMode>,
);
