import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionsPage from './TransactionsPage';
import API from '../services/api';

vi.mock('../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const today = new Date().toISOString().split('T')[0];

const sampleTransactions = [
  { _id: '1', type: 'expense', category: 'Food', amount: 45.5, description: 'Groceries', date: '2026-07-20' },
  ];

describe('TransactionsPage', () => {
    beforeEach(() => {
          API.get.mockReset();
          API.post.mockReset();
          API.delete.mockReset();
    });

           it('shows a loading message while fetching transactions', () => {
                 API.get.mockReturnValue(new Promise(() => {}));
                 render(<TransactionsPage />);
                 expect(screen.getByText('Loading...')).not.toBeNull();
           });

           it('renders an empty state when there are no transactions', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 render(<TransactionsPage />);
                 expect(await screen.findByText('No transactions yet. Add your first one!')).not.toBeNull();
           });

           it('renders fetched transactions', async () => {
                 API.get.mockResolvedValue({ data: sampleTransactions });
                 render(<TransactionsPage />);
                 expect(await screen.findByText('Food')).not.toBeNull();
                 expect(screen.getByText('-$45.5')).not.toBeNull();
                 expect(screen.getByText('(1)')).not.toBeNull();
           });

           it('shows an error message when loading transactions fails', async () => {
                 API.get.mockRejectedValue(new Error('network error'));
                 render(<TransactionsPage />);
                 expect(await screen.findByText('Failed to load transactions.')).not.toBeNull();
           });

           it('toggles the new transaction form when the button is clicked', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 render(<TransactionsPage />);
                 await screen.findByText('No transactions yet. Add your first one!');

                  fireEvent.click(screen.getByRole('button', { name: '+ Add Transaction' }));
                 expect(screen.getByText('New Transaction')).not.toBeNull();

                  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
                 expect(screen.queryByText('New Transaction')).toBeNull();
           });

           it('shows a validation error when submitting without a valid amount', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 render(<TransactionsPage />);
                 await screen.findByText('No transactions yet. Add your first one!');

                  fireEvent.click(screen.getByRole('button', { name: '+ Add Transaction' }));
                 fireEvent.click(screen.getByRole('button', { name: 'Save Transaction' }));

                  expect(await screen.findByText('Please enter a valid amount.')).not.toBeNull();
                 expect(API.post).not.toHaveBeenCalled();
           });

           it('creates a new transaction with the entered form data', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 API.post.mockResolvedValue({});
                 render(<TransactionsPage />);
                 await screen.findByText('No transactions yet. Add your first one!');

                  fireEvent.click(screen.getByRole('button', { name: '+ Add Transaction' }));
                 fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '120.5' } });
                 fireEvent.click(screen.getByRole('button', { name: 'Save Transaction' }));

                  await waitFor(() => {
                          expect(API.post).toHaveBeenCalledWith('/transactions', {
                                    type: 'expense',
                                    category: 'Food',
                                    amount: 120.5,
                                    description: '',
                                    date: today,
                          });
                  });
           });

           it('deletes a transaction after confirmation', async () => {
                 vi.spyOn(window, 'confirm').mockReturnValue(true);
                 API.get.mockResolvedValue({ data: sampleTransactions });
                 API.delete.mockResolvedValue({});
                 render(<TransactionsPage />);

                  fireEvent.click(await screen.findByTitle('Delete'));

                  await waitFor(() => {
                          expect(API.delete).toHaveBeenCalledWith('/transactions/1');
                  });
                 window.confirm.mockRestore();
           });
});
