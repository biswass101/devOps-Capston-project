import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MeasurementForm from '../../components/MeasurementForm';
import api from '../../api';

vi.mock('../../api', () => ({
  default: {
    post: vi.fn()
  }
}));

describe('MeasurementForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits a new measurement and notifies the parent', async () => {
    const onSaved = vi.fn();
    api.post.mockResolvedValue({ data: { measurement: { id: 1 } } });

    render(<MeasurementForm onSaved={onSaved} />);

    fireEvent.change(screen.getByLabelText(/weight/i), {
      target: { value: '72.5' }
    });
    fireEvent.click(screen.getByRole('button', { name: /save measurement/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/measurements',
        expect.objectContaining({ weightKg: 72.5 })
      );
    });

    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/measurement saved successfully/i)
    ).toBeInTheDocument();
  });

  it('shows an error message when the API call fails', async () => {
    api.post.mockRejectedValue({
      response: { data: { error: 'Backend validation failed' } }
    });

    render(<MeasurementForm />);
    fireEvent.click(screen.getByRole('button', { name: /save measurement/i }));

    await waitFor(() => {
      expect(screen.getByText(/backend validation failed/i)).toBeInTheDocument();
    });
  });
});
