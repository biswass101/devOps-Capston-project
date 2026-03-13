import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../App';
import api from '../../api';

vi.mock('../../api', () => ({
  default: {
    get: vi.fn()
  }
}));

vi.mock('../../components/MeasurementForm', () => ({
  default: () => <div>Measurement form stub</div>
}));

vi.mock('../../components/TrendChart', () => ({
  default: () => <div>Trend chart stub</div>
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders recent measurements from the API', async () => {
    api.get.mockResolvedValue({
      data: {
        rows: [
          {
            id: 1,
            bmi: 22.9,
            bmi_category: 'Normal',
            bmr: 1649,
            daily_calories: 2556,
            measurement_date: '2026-03-13'
          }
        ]
      }
    });

    render(<App />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/measurements');
    });

    expect(screen.getByText(/current bmi/i)).toBeInTheDocument();
    expect(screen.getByText(/total records/i)).toBeInTheDocument();
    expect(screen.getByText(/measurement form stub/i)).toBeInTheDocument();
  });

  it('renders an API error message when loading fails', async () => {
    api.get.mockRejectedValue({
      response: { data: { error: 'Measurements unavailable' } }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/measurements unavailable/i)).toBeInTheDocument();
    });
  });
});
