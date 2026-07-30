import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnalyticsPage from './AnalyticsPage';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: { get: vi.fn() },
}));

describe('AnalyticsPage', () => {
    beforeEach(() => {
          api.get.mockReset();
    });

           it('renders the page heading immediately', () => {
                 api.get.mockReturnValue(new Promise(() => {}));
                 render(<AnalyticsPage />);
                 expect(screen.getByText('Analytics')).not.toBeNull();
                 expect(screen.getByText(/Deep-dive into your financial patterns/)).not.toBeNull();
           });

           it('does not show empty-state messages while data is still loading', () => {
                 api.get.mockReturnValue(new Promise(() => {}));
                 render(<AnalyticsPage />);
                 expect(screen.queryByText('No spending data available.')).toBeNull();
           });

           it('renders empty states for each section when there is no analytics data', async () => {
                 api.get.mockResolvedValue({ data: [] });
                 render(<AnalyticsPage />);
                 expect(await screen.findByText('No spending data available.')).not.toBeNull();
                 expect(screen.getByText('No monthly data available.')).not.toBeNull();
                 expect(screen.getByText('No net worth data available.')).not.toBeNull();
                 expect(api.get).toHaveBeenCalledWith('/analytics/spending');
                 expect(api.get).toHaveBeenCalledWith('/analytics/income-vs-expense');
                 expect(api.get).toHaveBeenCalledWith('/analytics/net-worth');
           });

           it('shows an error message when loading analytics data fails', async () => {
                 api.get.mockRejectedValue(new Error('network error'));
                 render(<AnalyticsPage />);
                 expect(await screen.findByText('Failed to load analytics data.')).not.toBeNull();
           });
});
