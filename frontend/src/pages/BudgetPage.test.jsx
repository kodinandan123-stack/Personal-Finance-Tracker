import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BudgetPage from './BudgetPage';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const sampleBudgets = [
  { _id: '1', category: 'Food', limit: 400, spent: 120, month: '2026-07' },
  ];

describe('BudgetPage', () => {
    beforeEach(() => {
          api.get.mockReset();
          api.post.mockReset();
          api.put.mockReset();
          api.delete.mockReset();
    });

           it('shows a loading message while fetching budgets', () => {
                 api.get.mockReturnValue(new Promise(() => {}));
                 render(<BudgetPage />);
                 expect(screen.getByText('Loading budgets...')).not.toBeNull();
           });

           it('renders an empty state when there are no budgets', async () => {
                 api.get.mockResolvedValue({ data: [] });
                 render(<BudgetPage />);
                 expect(await screen.findByText('No budgets set yet.')).not.toBeNull();
           });

           it('renders fetched budgets with spend progress', async () => {
                 api.get.mockResolvedValue({ data: sampleBudgets });
                 render(<BudgetPage />);
                 expect(await screen.findByText('Food')).not.toBeNull();
                 expect(screen.getByText('Spent: $120.00')).not.toBeNull();
                 expect(screen.getByText('Limit: $400.00')).not.toBeNull();
                 expect(screen.getByText('30% used')).not.toBeNull();
           });

           it('shows an error message when loading budgets fails', async () => {
                 api.get.mockRejectedValue(new Error('network error'));
                 render(<BudgetPage />);
                 expect(await screen.findByText('Failed to load budgets.')).not.toBeNull();
           });

           it('opens the new budget form and creates a budget', async () => {
                 api.get.mockResolvedValue({ data: [] });
                 api.post.mockResolvedValue({});
                 const { container } = render(<BudgetPage />);
                 await screen.findByText('No budgets set yet.');

                  fireEvent.click(screen.getByRole('button', { name: '+ Add Budget' }));
                 fireEvent.change(screen.getByPlaceholderText('e.g. 500'), { target: { value: '250' } });
                 fireEvent.change(container.querySelector('input[type="month"]'), { target: { value: '2026-08' } });

                  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

                  await waitFor(() => {
                          expect(api.post).toHaveBeenCalledWith('/budgets', { category: 'Food', limit: '250', month: '2026-08' });
                  });
           });

           it('deletes a budget after confirmation', async () => {
                 vi.spyOn(window, 'confirm').mockReturnValue(true);
                 api.get.mockResolvedValue({ data: sampleBudgets });
                 api.delete.mockResolvedValue({});
                 render(<BudgetPage />);

                  fireEvent.click(await screen.findByText('Delete'));

                  await waitFor(() => {
                          expect(api.delete).toHaveBeenCalledWith('/budgets/1');
                  });
                 window.confirm.mockRestore();
           });
});
