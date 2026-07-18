jest.mock('../models/Transaction');
jest.mock('../models/Goal');

const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const {
  getSpendingAnalytics,
  getIncomeVsExpense,
  getNetWorth,
} = require('../controllers/analyticsController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('analyticsController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSpendingAnalytics', () => {
    test('groups expense transactions by category and computes percentages', async () => {
      const req = { user: { id: 'user1' }, query: { period: 'month', year: '2026', month: '7' } };
      const res = createMockRes();
      Transaction.find.mockResolvedValue([
        { _id: 't1', category: 'Food', amount: 60, description: 'Groceries', date: '2026-07-01' },
        { _id: 't2', category: 'Food', amount: 40, description: 'Snacks', date: '2026-07-05' },
        { _id: 't3', category: 'Transport', amount: 90, description: 'Fuel', date: '2026-07-10' },
      ]);

      await getSpendingAnalytics(req, res);

      expect(Transaction.find).toHaveBeenCalledWith(
        expect.objectContaining({ user: 'user1', type: 'expense' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data.totalSpent).toBe(190);
      expect(payload.data.transactionCount).toBe(3);
      expect(payload.data.categories[0]).toEqual({
        category: 'Food',
        total: 100,
        count: 2,
        percentage: 52.6,
      });
      expect(payload.data.categories[1]).toEqual({
        category: 'Transport',
        total: 90,
        count: 1,
        percentage: 47.4,
      });
    });

    test('returns zero totals when there are no matching transactions', async () => {
      const req = { user: { id: 'user1' }, query: {} };
      const res = createMockRes();
      Transaction.find.mockResolvedValue([]);

      await getSpendingAnalytics(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.data.totalSpent).toBe(0);
      expect(payload.data.categories).toEqual([]);
    });

    test('returns 500 on database error', async () => {
      const req = { user: { id: 'user1' }, query: {} };
      const res = createMockRes();
      Transaction.find.mockRejectedValue(new Error('db error'));

      await getSpendingAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error' });
    });
  });

  describe('getIncomeVsExpense', () => {
    test('builds a monthly series of income, expenses, and savings rate', async () => {
      const req = { user: { id: 'user1' }, query: { months: '1' } };
      const res = createMockRes();
      Transaction.aggregate
        .mockResolvedValueOnce([{ _id: null, total: 1000 }])
        .mockResolvedValueOnce([{ _id: null, total: 400 }]);

      await getIncomeVsExpense(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const payload = res.json.mock.calls[0][0];
      expect(payload.data).toHaveLength(1);
      expect(payload.data[0]).toEqual(
        expect.objectContaining({
          income: 1000,
          expenses: 400,
          netSavings: 600,
          savingsRate: 60,
        })
      );
    });

    test('caps the number of months at 24', async () => {
      const req = { user: { id: 'user1' }, query: { months: '48' } };
      const res = createMockRes();
      Transaction.aggregate.mockResolvedValue([]);

      await getIncomeVsExpense(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.data).toHaveLength(24);
    });

    test('returns 500 on database error', async () => {
      const req = { user: { id: 'user1' }, query: {} };
      const res = createMockRes();
      Transaction.aggregate.mockRejectedValue(new Error('db error'));

      await getIncomeVsExpense(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getNetWorth', () => {
    test('combines income, expenses, and goal savings into a net worth estimate', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Transaction.aggregate
        .mockResolvedValueOnce([{ _id: null, total: 5000 }])
        .mockResolvedValueOnce([{ _id: null, total: 2000 }]);
      Goal.find.mockResolvedValue([{ currentAmount: 300 }, { currentAmount: 200 }]);

      await getNetWorth(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalIncome: 5000,
          totalExpenses: 2000,
          netSavings: 3000,
          totalSavedForGoals: 500,
          estimatedNetWorth: 3500,
        },
      });
    });

    test('defaults totals to zero when there are no transactions or goals', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Transaction.aggregate.mockResolvedValue([]);
      Goal.find.mockResolvedValue([]);

      await getNetWorth(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalIncome: 0,
          totalExpenses: 0,
          netSavings: 0,
          totalSavedForGoals: 0,
          estimatedNetWorth: 0,
        },
      });
    });

    test('returns 500 on database error', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Transaction.aggregate.mockRejectedValue(new Error('db error'));

      await getNetWorth(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
