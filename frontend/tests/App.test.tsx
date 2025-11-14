import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';

import App from '../src/App';
import i18n from '../src/i18n/config';

const renderApp = () => {
  const queryClient = new QueryClient();
  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </I18nextProvider>,
  );
};

test('renders application header and language selector', () => {
  renderApp();
  expect(screen.getByText(/Krubik Solver/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Язык/i)).toBeInTheDocument();
});
