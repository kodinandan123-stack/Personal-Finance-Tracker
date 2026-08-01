import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportsPage from './ReportsPage';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: { get: vi.fn() },
}));

function mockApiResponses({ summary, categoryBreakdown, monthlyTrend } = {}) {
    api.get.mockImplementation((url) => {
          if (url.startsWith('/transactions/summary')) {
                  return Promise.resolve({ data: summary ?? { totalIncome: 0, totalExpenses: 0, netSavings: 0 } });
          }
          if (url.startsWith('/transactions/category-breakdown')) {
                  return Promise.resolve({ data: categoryBreakdown ?? [] });
          }
          if (url.startsWith('/transactions/monthly-trend')) {
                  return Promise.resolve({ data: monthlyTrend ?? [] });
          }
          return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
}

describe('ReportsPage', () => {
    beforeEach(() => {
          api.get.mockReset();
    });

           it('shows a loading indicator while report data is being fetched', () => {
                 api.get.mockReturnValue(new Promise(() => {}));
                 render(<ReportsPage />);
                 expect(screen.getByText('Loading reports...')).not.toBeNull();
           });

           it('renders the heading and summary totals once data has loaded', async () => {
                 mockApiResponses({ summary: { totalIncome: 5000, totalExpenses: 2000, netSavings: 3000 } });
                 render(<ReportsPage />);
                 expect(await screen.findByText('Financial Reports')).not.toBeNull();
                 expect(screen.getByText('$5,000.00')).not.toBeNull();
                 expect(screen.getByText('$2,000.00')).not.toBeNull();
                 expect(screen.getByText('$3,000.00')).not.toBeNull();
           });

           it('shows an empty state for the monthly trend chart when there is no data', async () => {
                 mockApiResponses();
                 render(<ReportsPage />);
                 expect(await screen.findByText('No data available for this year.')).not.toBeNull();
           });

           it('shows an empty state for category breakdown when there is no data', async () => {
                 mockApiResponses();
                 render(<ReportsPage />);
                 expect(await screen.findByText('No expense data available.')).not.toBeNull();
           });

           it('renders category breakdown rows sorted by total with percentages', async () => {
                 mockApiResponses({
                         categoryBreakdown: [
                           { category: 'Rent', total: 400 },
                           { category: 'Food', total: 600 },
                                 ],
                 });
                 render(<ReportsPage />);
                 expect(await screen.findByText('Food')).not.toBeNull();
                 expect(screen.getByText('$600.00 (60%)')).not.toBeNull();
                 expect(screen.getByText('Rent')).not.toBeNull();
                 expect(screen.getByText('$400.00 (40%)')).not.toBeNull();
           });

           it('shows an error message when loading report data fails', async () => {
                 api.get.mockRejectedValue(new Error('network error'));
                 render(<ReportsPage />);
                 expect(await screen.findByText('Failed to load report data.')).not.toBeNull();
           });
});
