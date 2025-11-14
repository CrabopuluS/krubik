import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';

import App from './App';
import i18n from './i18n/config';
import './styles.css';

type RuntimeConfig = {
  apiUrl?: string;
  csrfCookie?: string;
  csrfHeader?: string;
};

declare global {
  interface Window {
    krubikConfig?: RuntimeConfig;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
    },
  },
});

const configureRuntimeConfig = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const { VITE_API_URL, VITE_CSRF_COOKIE, VITE_CSRF_HEADER } = import.meta.env;
  const existingConfig = window.krubikConfig ?? {};

  window.krubikConfig = {
    apiUrl: VITE_API_URL ?? existingConfig.apiUrl,
    csrfCookie: VITE_CSRF_COOKIE ?? existingConfig.csrfCookie,
    csrfHeader: VITE_CSRF_HEADER ?? existingConfig.csrfHeader,
  };
};

configureRuntimeConfig();

createRoot(rootElement).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </I18nextProvider>
  </StrictMode>,
);
