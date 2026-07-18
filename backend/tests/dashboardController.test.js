jest.mock('../models/Transaction');
jest.mock('../models/Budget');
jest.mock('../models/Goal');

const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const { getDashboardSummary } = require('../controllers/dashboardController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('dashboardController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardSummary', () => {
    test('aggregates monthly totals, recent transactions, budgets, and goals', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();

      const monthlyTransactions = [
        { type: 'income', amount: 1000, category: 'Salary' },
        { type: 'expense', amount: 200, category: 'Food' },
        { type: 'expense', amount: 50, category: 'Food' },
      ];
      const recentTransactions = [{ _id: 't1' }, { _id: 't2' }];
      const budgets = [{ category: 'Food', limit: 300 }];
      const goals = [
        { name: 'Vacation', targetAmount: 1000, currentAmount: 250, deadline: '2026-12-01' },
      ];

      const limitMock = jest.fn().mockResolvedValue(recentTransactions);
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      Transaction.find
        .mockResolvedValueOnce(monthlyTransactions)
        .mockReturnValueOnce({ sort: sortMock });
      Budget.find.mockResolvedValue(budgets);
      Goal.find.mockResolvedValue(goals);

      await getDashboardSummary(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          monthlyIncome: 1000,
          monthlyExpenses: 250,
          netSavings: 750,
          recentTransactions,
          budgetStatus: [
            { category: 'Food', limit: 300, spent: 250, remaining: 50, percentUsed: '83.3' },
          ],
          goalsProgress: [
            {
              name: 'Vacation',
              targetAmount: 1000,
              currentAmount: 250,
              percentComplete: '25.0',
              deadline: '2026-12-01',
            },
          ],
        },
      });
    });

    test('handles zero-limit budgets and zero-target goals without dividing by zero', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();

      const limitMock = jest.fn().mockResolvedValue([]);
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      Transaction.find.mockResolvedValueOnce([]).mockReturnValueOnce({ sort: sortMock });
      Budget.find.mockResolvedValue([{ category: 'Misc', limit: 0 }]);
      Goal.find.mockResolvedValue([{ name: 'Car', targetAmount: 0, currentAmount: 0 }]);

      await getDashboardSummary(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.data.budgetStatus[0].percentUsed).toBe(0);
      expect(payload.data.goalsProgress[0].percentComplete).toBe(0);
    });

    test('returns 500 when a database call fails', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Transaction.find.mockRejectedValue(new Error('db error'));

      await getDashboardSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error' });
    });
  });
});
