jest.mock('../models/RecurringTransaction');
jest.mock('../models/Transaction');

const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  toggleRecurringTransaction,
  deleteRecurringTransaction,
  processDueTransactions,
} = require('../controllers/recurringTransactionController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('recurringTransactionController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecurringTransactions', () => {
    test('returns all recurring transactions for the user sorted by nextDueDate', async () => {
      const req = { user: { _id: 'user1' }, query: {} };
      const res = createMockRes();
      const items = [{ _id: 'r1' }, { _id: 'r2' }];
      const sortMock = jest.fn().mockResolvedValue(items);
      RecurringTransaction.find.mockReturnValue({ sort: sortMock });

      await getRecurringTransactions(req, res);

      expect(RecurringTransaction.find).toHaveBeenCalledWith({ user: 'user1' });
      expect(sortMock).toHaveBeenCalledWith({ nextDueDate: 1 });
      expect(res.json).toHaveBeenCalledWith(items);
    });

    test('filters by isActive when provided', async () => {
      const req = { user: { _id: 'user1' }, query: { isActive: 'false' } };
      const res = createMockRes();
      const sortMock = jest.fn().mockResolvedValue([]);
      RecurringTransaction.find.mockReturnValue({ sort: sortMock });

      await getRecurringTransactions(req, res);

      expect(RecurringTransaction.find).toHaveBeenCalledWith({ user: 'user1', isActive: false });
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { _id: 'user1' }, query: {} };
      const res = createMockRes();
      RecurringTransaction.find.mockImplementation(() => {
        throw new Error('db down');
      });

      await getRecurringTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createRecurringTransaction', () => {
    test('creates a recurring transaction defaulting startDate to now and nextDueDate to startDate', async () => {
      const req = {
        user: { _id: 'user1' },
        body: { type: 'expense', category: 'Rent', amount: 1200, description: 'Monthly rent', frequency: 'monthly' },
      };
      const res = createMockRes();
      const created = { _id: 'r1', ...req.body };
      RecurringTransaction.create.mockResolvedValue(created);

      await createRecurringTransaction(req, res);

      expect(RecurringTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: 'user1',
          type: 'expense',
          category: 'Rent',
          amount: 1200,
          description: 'Monthly rent',
          frequency: 'monthly',
          endDate: null,
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    test('returns 400 when creation fails validation', async () => {
      const req = { user: { _id: 'user1' }, body: {} };
      const res = createMockRes();
      RecurringTransaction.create.mockRejectedValue(new Error('Validation failed'));

      await createRecurringTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateRecurringTransaction', () => {
    test('returns 404 when the recurring transaction does not exist', async () => {
      const req = { params: { id: 'r1' }, user: { _id: 'user1' }, body: {} };
      const res = createMockRes();
      RecurringTransaction.findOneAndUpdate.mockResolvedValue(null);

      await updateRecurringTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('updates and returns the recurring transaction', async () => {
      const req = { params: { id: 'r1' }, user: { _id: 'user1' }, body: { amount: 1500 } };
      const res = createMockRes();
      const updated = { _id: 'r1', amount: 1500 };
      RecurringTransaction.findOneAndUpdate.mockResolvedValue(updated);

      await updateRecurringTransaction(req, res);

      expect(RecurringTransaction.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'r1', user: 'user1' },
        req.body,
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    test('returns 400 when the update fails validation', async () => {
      const req = { params: { id: 'r1' }, user: { _id: 'user1' }, body: { amount: -5 } };
      const res = createMockRes();
      RecurringTransaction.findOneAndUpdate.mockRejectedValue(new Error('Validation failed'));

      await updateRecurringTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('toggleRecurringTransaction', () => {
    test('returns 404 when the recurring transaction does not exist', async () => {
      const req = { params: { id: 'r1' }, user: { _id: 'user1' } };
      const res = createMockRes();
      RecurringTransaction.findOne.mockResolvedValue(null);

      await toggleRecurringTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('flips isActive and saves', async () => {
      const req = { params: { id: 'r1' }, user: { _id: 'user1' } };
      const res = createMockRes();
      const recurring = { isActive: true, save: jest.fn().mockResolvedValue({}) };
      RecurringTransaction.findOne.mockResolvedValue(recurring);

      await toggleRecurringTransaction(req, res);

      expect(recurring.isActive).toBe(false);
      expect(recurring.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(recurring);
    });

    test('returns 500 when the database throws', async () => {
      const req = { params: { id: 'r1' }, user: { _id: 'user1' } };
      const res = createMockRes();
      RecurringTransaction.findOne.mockRejectedValue(new Error('db down'));

      await toggleRecurringTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteRecurringTransaction', () => {
    test('returns 404 when the recurring transaction does not exist', async () => {
      const req = { params: { id: 'r1' }, user: { _id: 'user1' } };
      const res = createMockRes();
      RecurringTransaction.findOneAndDelete.mockResolvedValue(null);

      await deleteRecurringTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('deletes the recurring transaction', async () => {
      const req = { params: { id: 'r1' }, user: { _id: 'user1' } };
      const res = createMockRes();
      RecurringTransaction.findOneAndDelete.mockResolvedValue({ _id: 'r1' });

      await deleteRecurringTransaction(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Recurring transaction deleted' });
    });

    test('returns 500 when the database throws', async () => {
      const req = { params: { id: 'r1' }, user: { _id: 'user1' } };
      const res = createMockRes();
      RecurringTransaction.findOneAndDelete.mockRejectedValue(new Error('db down'));

      await deleteRecurringTransaction(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('processDueTransactions', () => {
    test('creates a transaction and advances nextDueDate for each due item', async () => {
      const req = { user: { _id: 'user1' } };
      const res = createMockRes();
      const dueItem = {
        user: 'user1',
        type: 'expense',
        category: 'Rent',
        amount: 1200,
        description: 'Rent',
        nextDueDate: new Date('2026-07-01'),
        frequency: 'monthly',
        endDate: null,
        save: jest.fn().mockResolvedValue({}),
      };
      RecurringTransaction.find.mockResolvedValue([dueItem]);
      const createdTx = { _id: 't1' };
      Transaction.create.mockResolvedValue(createdTx);
      RecurringTransaction.advanceDate.mockReturnValue(new Date('2026-08-01'));

      await processDueTransactions(req, res);

      expect(Transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({ user: 'user1', type: 'expense', category: 'Rent', amount: 1200 })
      );
      expect(dueItem.save).toHaveBeenCalled();
      expect(dueItem.nextDueDate).toEqual(new Date('2026-08-01'));
      expect(res.json).toHaveBeenCalledWith({ processed: 1, transactions: [createdTx] });
    });

    test('deactivates and skips items whose endDate has passed', async () => {
      const req = { user: { _id: 'user1' } };
      const res = createMockRes();
      const expiredItem = {
        user: 'user1',
        nextDueDate: new Date('2026-07-01'),
        endDate: new Date('2026-01-01'),
        isActive: true,
        save: jest.fn().mockResolvedValue({}),
      };
      RecurringTransaction.find.mockResolvedValue([expiredItem]);

      await processDueTransactions(req, res);

      expect(expiredItem.isActive).toBe(false);
      expect(expiredItem.save).toHaveBeenCalled();
      expect(Transaction.create).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ processed: 0, transactions: [] });
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { _id: 'user1' } };
      const res = createMockRes();
      RecurringTransaction.find.mockRejectedValue(new Error('db down'));

      await processDueTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
