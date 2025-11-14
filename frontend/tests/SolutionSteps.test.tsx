import { act, render, screen, waitFor } from '@testing-library/react';
import SolutionSteps from '../src/components/SolutionSteps';

describe('SolutionSteps', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('animates through moves', async () => {
    render(<SolutionSteps moves={['R', 'U', "R'"]} status="success" />);

    const items = await screen.findAllByRole('listitem');
    await waitFor(() => {
      expect(items[0]).toHaveClass('solution-steps__item--active');
    });

    act(() => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(items[1]).toHaveClass('solution-steps__item--active');
    });
  });
});
