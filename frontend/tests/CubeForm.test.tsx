import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CubeForm from '../src/components/CubeForm';

describe('CubeForm', () => {
  it('validates length and prevents submission', async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    render(<CubeForm onSubmit={handleSubmit} isLoading={false} />);

    const textarea = screen.getByLabelText(/состояние кубика/i);
    fireEvent.change(textarea, { target: { value: 'U'.repeat(10) } });
    fireEvent.submit(screen.getByTestId('cube-form'));

    expect(await screen.findByText(/54 символа/)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits normalized input', async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    render(<CubeForm onSubmit={handleSubmit} isLoading={false} />);

    const textarea = screen.getByLabelText(/состояние кубика/i);
    fireEvent.change(textarea, {
      target: {
        value: 'uuuuuuuuu\nrrrrrrrrr\nfffffffff\nddddddddd\nlllllllll\nbbbbbbbbb',
      },
    });
    fireEvent.submit(screen.getByTestId('cube-form'));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB',
      );
    });
  });
});
