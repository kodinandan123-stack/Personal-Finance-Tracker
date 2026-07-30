import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecurringPage from './RecurringPage';
import API from '../services/api';

vi.mock('../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const today = new Date().toISOString().split('T')[0];

const sampleItems = [
  { _id: '1', type: 'expense', category: 'Food', amount: 60, description: 'Weekly groceries', frequency: 'weekly', nextDue: '2026-08-05' },
  ];

describe('RecurringPage', () => {
    beforeEach(() => {
          API.get.mockReset();
          API.post.mockReset();
          API.delete.mockReset();
    });

           it('renders an empty state when there are no recurring transactions', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 render(<RecurringPage />);
                 expect(await screen.findByText('No recurring transactions yet. Add one above!')).not.toBeNull();
           });

           it('renders fetched recurring transactions', async () => {
                 API.get.mockResolvedValue({ data: sampleItems });
                 render(<RecurringPage />);
                 expect(await screen.findByText('Food')).not.toBeNull();
                 expect(screen.getByText('-$60')).not.toBeNull();
                 expect(screen.getByText(/Weekly groceries/)).not.toBeNull();
           });

           it('toggles the new recurring transaction form when the button is clicked', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 render(<RecurringPage />);
                 await screen.findByText('No recurring transactions yet. Add one above!');

                  fireEvent.click(screen.getByRole('button', { name: '+ New Recurring' }));
                 expect(screen.getByText('New Recurring Transaction')).not.toBeNull();

                  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
                 expect(screen.queryByText('New Recurring Transaction')).toBeNull();
           });

           it('shows a warning notification when submitting without a valid amount', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 render(<RecurringPage />);
                 await screen.findByText('No recurring transactions yet. Add one above!');

                  fireEvent.click(screen.getByRole('button', { name: '+ New Recurring' }));
                 fireEvent.click(screen.getByRole('button', { name: 'Save Recurring Transaction' }));

                  expect(await screen.findByText('Please enter a valid amount.')).not.toBeNull();
                 expect(API.post).not.toHaveBeenCalled();
           });

           it('creates a new recurring transaction with the entered form data', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 API.post.mockResolvedValue({});
                 render(<RecurringPage />);
                 await screen.findByText('No recurring transactions yet. Add one above!');

                  fireEvent.click(screen.getByRole('button', { name: '+ New Recurring' }));
                 fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '100' } });
                 fireEvent.click(screen.getByRole('button', { name: 'Save Recurring Transaction' }));

                  await waitFor(() => {
                          expect(API.post).toHaveBeenCalledWith('/recurring', {
                                    type: 'expense',
                                    category: 'Food',
                                    amount: 100,
                                    description: '',
                                    frequency: 'monthly',
                                    startDate: today,
                          });
                  });
                 expect(await screen.findByText('Recurring transaction added!')).not.toBeNull();
           });

           it('processes a recurring transaction when Run is clicked', async () => {
                 API.get.mockResolvedValue({ data: sampleItems });
                 API.post.mockResolvedValue({});
                 render(<RecurringPage />);

                  fireEvent.click(await screen.findByTitle('Process now'));

                  await waitFor(() => {
                          expect(API.post).toHaveBeenCalledWith('/recurring/1/process');
                  });
                 expect(await screen.findByText('Transaction processed successfully!')).not.toBeNull();
           });

           it('deletes a recurring transaction after confirmation', async () => {
                 vi.spyOn(window, 'confirm').mockReturnValue(true);
                 API.get.mockResolvedValue({ data: sampleItems });
                 API.delete.mockResolvedValue({});
                 render(<RecurringPage />);

                  fireEvent.click(await screen.findByTitle('Delete'));

                  await waitFor(() => {
                          expect(API.delete).toHaveBeenCalledWith('/recurring/1');
                  });
                 expect(await screen.findByText('Recurring transaction deleted.')).not.toBeNull();
                 window.confirm.mockRestore();
           });
});
