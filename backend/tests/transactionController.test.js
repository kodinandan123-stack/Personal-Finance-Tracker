jest.mock('../models/Transaction');

const Transaction = require('../models/Transaction');
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  exportTransactionsCSV,
} = require('../controllers/transactionController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  return res;
};

describe('transactionController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    test('returns paginated transactions with metadata', async () => {
      const req = { user: { id: 'user1' }, query: { page: '2', limit: '5' } };
      const res = createMockRes();
      const transactions = [{ _id: 't1' }, { _id: 't2' }];

      const limitMock = jest.fn().mockResolvedValue(transactions);
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      Transaction.find.mockReturnValue({ sort: sortMock });
      Transaction.countDocuments.mockResolvedValue(12);

      await getTransactions(req, res);

      expect(skipMock).toHaveBeenCalledWith(5);
      expect(limitMock).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith({
        transactions,
        pagination: {
          total: 12,
          page: 2,
          limit: 5,
          totalPages: 3,
          hasNextPage: true,
          hasPrevPage: true,
        },
      });
    });

    test('caps the page size at 100', async () => {
      const req = { user: { id: 'user1' }, query: { limit: '500' } };
      const res = createMockRes();
      const limitMock = jest.fn().mockResolvedValue([]);
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      Transaction.find.mockReturnValue({ sort: sortMock });
      Transaction.countDocuments.mockResolvedValue(0);

      await getTransactions(req, res);

      expect(limitMock).toHaveBeenCalledWith(100);
    });

    test('returns 500 on database error', async () => {
      const req = { user: { id: 'user1' }, query: {} };
      const res = createMockRes();
      Transaction.find.mockImplementation(() => {
        throw new Error('db error');
      });

      await getTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addTransaction', () => {
    test('creates a transaction when required fields are present', async () => {
      const req = {
        user: { id: 'user1' },
        body: { type: 'expense', category: 'Food', amount: 25, description: 'Lunch' },
      };
      const res = createMockRes();
      const created = { _id: 't1', ...req.body };
      Transaction.create.mockResolvedValue(created);

      await addTransaction(req, res);

      expect(Transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({ user: 'user1', type: 'expense', category: 'Food', amount: 25 })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    test('returns 400 when required fields are missing', async () => {
      const req = { user: { id: 'user1' }, body: { type: 'expense' } };
      const res = createMockRes();

      await addTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(Transaction.create).not.toHaveBeenCalled();
    });

    test('returns 500 on database error', async () => {
      const req = {
        user: { id: 'user1' },
        body: { type: 'expense', category: 'Food', amount: 25 },
      };
      const res = createMockRes();
      Transaction.create.mockRejectedValue(new Error('db error'));

      await addTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateTransaction', () => {
    test('updates a transaction owned by the user', async () => {
      const req = { params: { id: 't1' }, user: { id: 'user1' }, body: { amount: 99 } };
      const res = createMockRes();
      Transaction.findById.mockResolvedValue({ _id: 't1', user: { toString: () => 'user1' } });
      const updated = { _id: 't1', amount: 99 };
      Transaction.findByIdAndUpdate.mockResolvedValue(updated);

      await updateTransaction(req, res);

      expect(Transaction.findByIdAndUpdate).toHaveBeenCalledWith('t1', req.body, {
        new: true,
        runValidators: true,
      });
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    test('returns 404 when the transaction does not exist', async () => {
      const req = { params: { id: 'missing' }, user: { id: 'user1' }, body: {} };
      const res = createMockRes();
      Transaction.findById.mockResolvedValue(null);

      await updateTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 403 when the transaction belongs to another user', async () => {
      const req = { params: { id: 't1' }, user: { id: 'user1' }, body: {} };
      const res = createMockRes();
      Transaction.findById.mockResolvedValue({ _id: 't1', user: { toString: () => 'otherUser' } });

      await updateTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(Transaction.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('deleteTransaction', () => {
    test('deletes a transaction owned by the user', async () => {
      const req = { params: { id: 't1' }, user: { id: 'user1' } };
      const res = createMockRes();
      const deleteOneMock = jest.fn().mockResolvedValue();
      Transaction.findById.mockResolvedValue({
        _id: 't1',
        user: { toString: () => 'user1' },
        deleteOne: deleteOneMock,
      });

      await deleteTransaction(req, res);

      expect(deleteOneMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction removed' });
    });

    test('returns 404 when the transaction does not exist', async () => {
      const req = { params: { id: 'missing' }, user: { id: 'user1' } };
      const res = createMockRes();
      Transaction.findById.mockResolvedValue(null);

      await deleteTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 403 when the transaction belongs to another user', async () => {
      const req = { params: { id: 't1' }, user: { id: 'user1' } };
      const res = createMockRes();
      Transaction.findById.mockResolvedValue({ _id: 't1', user: { toString: () => 'otherUser' } });

      await deleteTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('getSummary', () => {
    test('computes totals, category, and monthly breakdowns', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Transaction.find.mockResolvedValue([
        { type: 'income', amount: 1000, category: 'Salary', date: '2026-06-01' },
        { type: 'expense', amount: 200, category: 'Food', date: '2026-06-05' },
        { type: 'expense', amount: 50, category: 'Food', date: '2026-07-01' },
      ]);

      await getSummary(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.totalIncome).toBe(1000);
      expect(payload.totalExpenses).toBe(250);
      expect(payload.balance).toBe(750);
      expect(payload.categoryBreakdown.Food).toEqual({ expense: 250 });
      expect(Object.keys(payload.monthlyBreakdown)).toEqual(['2026-06', '2026-07']);
    });

    test('returns 500 on database error', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Transaction.find.mockRejectedValue(new Error('db error'));

      await getSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('exportTransactionsCSV', () => {
    test('streams a CSV of the filtered transactions', async () => {
      const req = { user: { id: 'user1' }, query: { type: 'expense' } };
      const res = createMockRes();
      Transaction.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { date: '2026-07-01T00:00:00.000Z', type: 'expense', category: 'Food', amount: 20, description: 'Lunch' },
        ]),
      });

      await exportTransactionsCSV(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      const csv = res.send.mock.calls[0][0];
      expect(csv).toContain('Date,Type,Category,Amount,Description');
      expect(csv).toContain('2026-07-01,expense,"Food",20,"Lunch"');
    });

    test('returns 500 on database error', async () => {
      const req = { user: { id: 'user1' }, query: {} };
      const res = createMockRes();
      Transaction.find.mockImplementation(() => {
        throw new Error('db error');
      });

      await exportTransactionsCSV(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
