import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from './DashboardPage';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

vi.mock('../services/api', () => ({
  default: { get: vi.fn() },
}));

const mockUser = { name: 'Jane Doe', email: 'jane@example.com' };

function renderWithAuth(user = mockUser) {
    return render(
          <AuthContext.Provider value={{ user, setUser: vi.fn() }}>
                  <DashboardPage />
          </AuthContext.Provider>
        );
}

function mockApiResponses({ summary, transactions, dashboard } = {}) {
    API.get.mockImplementation((url) => {
          if (url === '/transactions/summary') {
                  return Promise.resolve({ data: summary ?? { totalIncome: 0, totalExpenses: 0, balance: 0 } });
          }
          if (url === '/transactions?limit=5') {
                  return Promise.resolve({ data: transactions ?? [] });
          }
          if (url === '/dashboard') {
                  return dashboard ? Promise.resolve({ data: dashboard }) : Promise.reject(new Error('no dashboard'));
          }
          return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
}

describe('DashboardPage', () => {
    beforeEach(() => {
          API.get.mockReset();
    });

           it("renders the heading and a welcome message with the user's name", () => {
                 mockApiResponses();
                 renderWithAuth();
                 expect(screen.getByText('Dashboard')).not.toBeNull();
                 expect(screen.getByText('Welcome back, Jane Doe!')).not.toBeNull();
           });

           it('falls back to a generic greeting when there is no user name', () => {
                 mockApiResponses();
                 renderWithAuth(null);
                 expect(screen.getByText('Welcome back, User!')).not.toBeNull();
           });

           it('renders summary card totals once data has loaded', async () => {
                 mockApiResponses({ summary: { totalIncome: 5000, totalExpenses: 2000, balance: 3000 } });
                 renderWithAuth();
                 expect(await screen.findByText('$5,000.00')).not.toBeNull();
                 expect(screen.getByText('$2,000.00')).not.toBeNull();
                 expect(screen.getByText('$3,000.00')).not.toBeNull();
           });

           it('shows an empty state when there are no recent transactions', async () => {
                 mockApiResponses();
                 renderWithAuth();
                 expect(await screen.findByText(/No transactions yet\./)).not.toBeNull();
           });

           it('renders recent transactions returned from the API', async () => {
                 mockApiResponses({
                         transactions: [
                           { _id: '1', type: 'income', category: 'Salary', description: 'July paycheck', amount: 2500, date: '2026-07-01' },
                           { _id: '2', type: 'expense', category: 'Groceries', description: '', amount: 85, date: '2026-07-02' },
                                 ],
                 });
                 renderWithAuth();
                 expect(await screen.findByText('Salary')).not.toBeNull();
                 expect(screen.getByText('Groceries')).not.toBeNull();
                 expect(screen.getByText('+$2,500')).not.toBeNull();
                 expect(screen.getByText('-$85')).not.toBeNull();
           });

           it('shows an error message when loading dashboard data fails', async () => {
                 API.get.mockImplementation((url) => {
                         if (url === '/dashboard') return Promise.reject(new Error('no dashboard'));
                         return Promise.reject(new Error('network error'));
                 });
                 renderWithAuth();
                 expect(await screen.findByText('Failed to load dashboard data.')).not.toBeNull();
           });
});
