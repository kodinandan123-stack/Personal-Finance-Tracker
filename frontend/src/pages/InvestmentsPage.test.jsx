import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InvestmentsPage from './InvestmentsPage';
import { getInvestments, createInvestment, deleteInvestment } from '../services/api';

vi.mock('../services/api', () => ({
    getInvestments: vi.fn(),
    createInvestment: vi.fn(),
    updateInvestment: vi.fn(),
    deleteInvestment: vi.fn(),
}));

const sampleInvestments = [
  { _id: '1', name: 'Apple Inc.', type: 'stock', symbol: 'AAPL', shares: 10, purchasePrice: 100, currentPrice: 150, purchaseDate: '2026-01-15' },
  ];

const sampleSummary = { totalCost: 1000, totalMarketValue: 1500, totalGainLoss: 500, returnPercent: 50 };

describe('InvestmentsPage', () => {
    beforeEach(() => {
          getInvestments.mockReset();
          createInvestment.mockReset();
          deleteInvestment.mockReset();
    });

           it('shows a loading message while fetching investments', () => {
                 getInvestments.mockReturnValue(new Promise(() => {}));
                 render(<InvestmentsPage />);
                 expect(screen.getByText('Loading investments...')).not.toBeNull();
           });

           it('renders an empty state when there are no investments', async () => {
                 getInvestments.mockResolvedValue({ data: [] });
                 render(<InvestmentsPage />);
                 expect(await screen.findByText('No investments yet. Add your first one above.')).not.toBeNull();
           });

           it('renders fetched investments with computed gain/loss and summary stats', async () => {
                 getInvestments.mockResolvedValue({ data: { investments: sampleInvestments, summary: sampleSummary } });
                 render(<InvestmentsPage />);
                 expect(await screen.findByText('Apple Inc.')).not.toBeNull();
                 expect(screen.getByText('AAPL')).not.toBeNull();
                 expect(screen.getByText('+$500.00')).not.toBeNull();
                 expect(screen.getByText('Total Cost')).not.toBeNull();
                 expect(screen.getByText('$1000.00')).not.toBeNull();
           });

           it('toggles the add investment form when the button is clicked', async () => {
                 getInvestments.mockResolvedValue({ data: [] });
                 render(<InvestmentsPage />);
                 await screen.findByText('No investments yet. Add your first one above.');

                  fireEvent.click(screen.getByRole('button', { name: '+ Add Investment' }));
                 expect(screen.getByPlaceholderText('Investment Name')).not.toBeNull();

                  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
                 expect(screen.queryByPlaceholderText('Investment Name')).toBeNull();
           });

           it('creates a new investment with the entered form data', async () => {
                 getInvestments.mockResolvedValue({ data: [] });
                 createInvestment.mockResolvedValue({});
                 render(<InvestmentsPage />);
                 await screen.findByText('No investments yet. Add your first one above.');

                  fireEvent.click(screen.getByRole('button', { name: '+ Add Investment' }));
                 fireEvent.change(screen.getByPlaceholderText('Investment Name'), { target: { value: 'Tesla' } });
                 fireEvent.change(screen.getByPlaceholderText('Shares / Units'), { target: { value: '5' } });
                 fireEvent.change(screen.getByPlaceholderText('Purchase Price ($)'), { target: { value: '200' } });
                 fireEvent.change(screen.getByPlaceholderText('Current Price ($)'), { target: { value: '250' } });
                 fireEvent.click(screen.getByRole('button', { name: 'Add Investment' }));

                  await waitFor(() => {
                          expect(createInvestment).toHaveBeenCalledWith({
                                    name: 'Tesla',
                                    type: 'stock',
                                    symbol: '',
                                    shares: '5',
                                    purchasePrice: '200',
                                    currentPrice: '250',
                                    purchaseDate: '',
                          });
                  });
           });

           it('deletes an investment after confirmation', async () => {
                 vi.spyOn(window, 'confirm').mockReturnValue(true);
                 getInvestments.mockResolvedValue({ data: { investments: sampleInvestments, summary: sampleSummary } });
                 deleteInvestment.mockResolvedValue({});
                 render(<InvestmentsPage />);

                  fireEvent.click(await screen.findByText('Delete'));

                  await waitFor(() => {
                          expect(deleteInvestment).toHaveBeenCalledWith('1');
                  });
                 window.confirm.mockRestore();
           });
});
