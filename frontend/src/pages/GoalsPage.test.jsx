import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoalsPage from './GoalsPage';
import API from '../services/api';

vi.mock('../services/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const sampleGoals = [
  { _id: '1', name: 'Emergency Fund', targetAmount: 1000, savedAmount: 250, deadline: '2026-12-01' },
  ];

describe('GoalsPage', () => {
    beforeEach(() => {
          API.get.mockReset();
          API.post.mockReset();
          API.delete.mockReset();
    });

           it('renders an empty state when there are no goals', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 render(<GoalsPage />);
                 expect(await screen.findByText('No savings goals yet')).not.toBeNull();
           });

           it('renders fetched goals with progress details', async () => {
                 API.get.mockResolvedValue({ data: sampleGoals });
                 render(<GoalsPage />);
                 expect(await screen.findByText('Emergency Fund')).not.toBeNull();
                 expect(screen.getByText(/Deadline:/)).not.toBeNull();
                 expect(screen.getByText('25%')).not.toBeNull();
                 expect(screen.getByText('$750 remaining to reach your goal')).not.toBeNull();
           });

           it('toggles the new goal form when the button is clicked', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 render(<GoalsPage />);
                 await screen.findByText('No savings goals yet');

                  fireEvent.click(screen.getByRole('button', { name: '+ New Goal' }));
                 expect(screen.getByText('New Savings Goal')).not.toBeNull();

                  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
                 expect(screen.queryByText('New Savings Goal')).toBeNull();
           });

           it('shows a validation error when submitting without a valid target amount', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 render(<GoalsPage />);
                 await screen.findByText('No savings goals yet');

                  fireEvent.click(screen.getByRole('button', { name: '+ New Goal' }));
                 fireEvent.change(screen.getByPlaceholderText('e.g. Emergency Fund, New Laptop'), { target: { value: 'Trip' } });
                 fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }));

                  expect(await screen.findByText('Please enter a valid goal name and target amount.')).not.toBeNull();
                 expect(API.post).not.toHaveBeenCalled();
           });

           it('creates a new goal with the entered form data', async () => {
                 API.get.mockResolvedValue({ data: [] });
                 API.post.mockResolvedValue({});
                 render(<GoalsPage />);
                 await screen.findByText('No savings goals yet');

                  fireEvent.click(screen.getByRole('button', { name: '+ New Goal' }));
                 fireEvent.change(screen.getByPlaceholderText('e.g. Emergency Fund, New Laptop'), { target: { value: 'New Laptop' } });
                 fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '1500' } });
                 fireEvent.click(screen.getByRole('button', { name: 'Create Goal' }));

                  await waitFor(() => {
                          expect(API.post).toHaveBeenCalledWith('/goals', {
                                    name: 'New Laptop',
                                    targetAmount: 1500,
                                    savedAmount: 0,
                                    deadline: undefined,
                          });
                  });
           });

           it('deletes a goal after confirmation', async () => {
                 vi.spyOn(window, 'confirm').mockReturnValue(true);
                 API.get.mockResolvedValue({ data: sampleGoals });
                 API.delete.mockResolvedValue({});
                 render(<GoalsPage />);

                  fireEvent.click(await screen.findByTitle('Delete goal'));

                  await waitFor(() => {
                          expect(API.delete).toHaveBeenCalledWith('/goals/1');
                  });
                 window.confirm.mockRestore();
           });
});
