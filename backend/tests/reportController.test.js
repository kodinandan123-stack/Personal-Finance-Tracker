jest.mock('../models/Transaction');

const Transaction = require('../models/Transaction');
const { getSpendingByCategory, getMonthlyTrend } = require('../controllers/reportController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('reportController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSpendingByCategory', () => {
    test('aggregates expense totals by category for the requested month and year', async () => {
      const req = { user: { id: 'user1' }, query: { month: '3', year: '2026' } };
      const res = createMockRes();
      const transactions = [
        { category: 'Food', amount: 100 },
        { category: 'Food', amount: 50 },
        { category: 'Transport', amount: 30 },
      ];
      Transaction.find.mockResolvedValue(transactions);

      await getSpendingByCategory(req, res);

      expect(Transaction.find).toHaveBeenCalledWith(
        expect.objectContaining({ user: 'user1', type: 'expense' })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          { category: 'Food', total: 150 },
          { category: 'Transport', total: 30 },
        ]),
      });
    });

    test('defaults to the current month and year when none are provided', async () => {
      const req = { user: { id: 'user1' }, query: {} };
      const res = createMockRes();
      Transaction.find.mockResolvedValue([]);

      await getSpendingByCategory(req, res);

      expect(Transaction.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { id: 'user1' }, query: {} };
      const res = createMockRes();
      Transaction.find.mockRejectedValue(new Error('db down'));

      await getSpendingByCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error' });
    });
  });

  describe('getMonthlyTrend', () => {
    test('returns income, expenses, and net for the last 6 months', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Transaction.find.mockResolvedValue([
        { type: 'income', amount: 1000 },
        { type: 'expense', amount: 400 },
      ]);

      await getMonthlyTrend(req, res);

      expect(Transaction.find).toHaveBeenCalledTimes(6);
      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data).toHaveLength(6);
      expect(payload.data[0]).toEqual(
        expect.objectContaining({ income: 1000, expenses: 400, net: 600 })
      );
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Transaction.find.mockRejectedValue(new Error('db down'));

      await getMonthlyTrend(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error' });
    });
  });
});
