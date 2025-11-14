import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';

import CubeInputWizard from '../src/components/CubeInputWizard';
import i18n from '../src/i18n/config';

const renderWizard = () => {
  const queryClient = new QueryClient();
  render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <CubeInputWizard />
      </QueryClientProvider>
    </I18nextProvider>,
  );
};

test('allows selecting colors for the current face', () => {
  renderWizard();
  const redButton = screen.getByRole('button', { name: 'R' });
  fireEvent.click(redButton);
  const facelet = screen.getByRole('button', { name: /Set U facelet 1/i });
  fireEvent.click(facelet);
  expect(facelet).toHaveStyle({ backgroundColor: 'rgb(239, 68, 68)' });
});
