jest.mock('../models/Transaction');

const Transaction = require('../models/Transaction');
const { exportTransactionsCSV } = require('../controllers/exportController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  return res;
};

describe('exportController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportTransactionsCSV', () => {
    test('builds a CSV of the user\'s transactions sorted by date descending', async () => {
      const req = { user: { id: 'user1' }, query: {} };
      const res = createMockRes();
      const leanMock = jest.fn().mockResolvedValue([
        {
          date: '2026-07-01T00:00:00.000Z',
          type: 'expense',
          category: 'Food',
          amount: 42.5,
          description: 'Lunch',
        },
      ]);
      const sortMock = jest.fn().mockReturnValue({ lean: leanMock });
      Transaction.find.mockReturnValue({ sort: sortMock });

      await exportTransactionsCSV(req, res);

      expect(Transaction.find).toHaveBeenCalledWith({ user: 'user1' });
      expect(sortMock).toHaveBeenCalledWith({ date: -1 });
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.status).toHaveBeenCalledWith(200);
      const csv = res.send.mock.calls[0][0];
      expect(csv).toContain('Date,Type,Category,Amount,Description');
      expect(csv).toContain('2026-07-01,expense,Food,42.50,Lunch');
    });

    test('applies type and date range filters from the query string', async () => {
      const req = {
        user: { id: 'user1' },
        query: { type: 'income', startDate: '2026-07-01', endDate: '2026-07-31' },
      };
      const res = createMockRes();
      const leanMock = jest.fn().mockResolvedValue([]);
      const sortMock = jest.fn().mockReturnValue({ lean: leanMock });
      Transaction.find.mockReturnValue({ sort: sortMock });

      await exportTransactionsCSV(req, res);

      const filterArg = Transaction.find.mock.calls[0][0];
      expect(filterArg.user).toBe('user1');
      expect(filterArg.type).toBe('income');
      expect(filterArg.date.$gte).toEqual(new Date('2026-07-01'));
      expect(filterArg.date.$lte.getDate()).toBe(31);
    });

    test('ignores an invalid type filter', async () => {
      const req = { user: { id: 'user1' }, query: { type: 'transfer' } };
      const res = createMockRes();
      const leanMock = jest.fn().mockResolvedValue([]);
      const sortMock = jest.fn().mockReturnValue({ lean: leanMock });
      Transaction.find.mockReturnValue({ sort: sortMock });

      await exportTransactionsCSV(req, res);

      const filterArg = Transaction.find.mock.calls[0][0];
      expect(filterArg.type).toBeUndefined();
    });

    test('returns 500 when the database query fails', async () => {
      const req = { user: { id: 'user1' }, query: {} };
      const res = createMockRes();
      Transaction.find.mockImplementation(() => {
        throw new Error('db error');
      });

      await exportTransactionsCSV(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Failed to export transactions' })
      );
    });
  });
});
