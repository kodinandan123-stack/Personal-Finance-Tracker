jest.mock('../models/Budget');

const Budget = require('../models/Budget');
const {
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
} = require('../controllers/budgetController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('budgetController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBudget', () => {
    test('creates a new budget when one does not already exist for the category/month', async () => {
      const req = {
        user: { _id: 'user1' },
        body: { category: 'Food', limit: 300, month: '2026-07' },
      };
      const res = createMockRes();
      Budget.findOne.mockResolvedValue(null);
      const created = { _id: 'b1', ...req.body };
      Budget.create.mockResolvedValue(created);

      await createBudget(req, res);

      expect(Budget.findOne).toHaveBeenCalledWith({ user: 'user1', category: 'Food', month: '2026-07' });
      expect(Budget.create).toHaveBeenCalledWith({ user: 'user1', category: 'Food', limit: 300, month: '2026-07' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    test('returns 400 when a budget already exists for the category/month', async () => {
      const req = {
        user: { _id: 'user1' },
        body: { category: 'Food', limit: 300, month: '2026-07' },
      };
      const res = createMockRes();
      Budget.findOne.mockResolvedValue({ _id: 'existing' });

      await createBudget(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(Budget.create).not.toHaveBeenCalled();
    });

    test('returns 400 on duplicate key error from the database', async () => {
      const req = {
        user: { _id: 'user1' },
        body: { category: 'Food', limit: 300, month: '2026-07' },
      };
      const res = createMockRes();
      Budget.findOne.mockResolvedValue(null);
      const duplicateError = new Error('duplicate');
      duplicateError.code = 11000;
      Budget.create.mockRejectedValue(duplicateError);

      await createBudget(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate budget entry for this category and month.' });
    });
  });

  describe('updateBudget', () => {
    test('updates fields and saves the budget', async () => {
      const req = {
        params: { id: 'b1' },
        user: { _id: 'user1' },
        body: { limit: 400 },
      };
      const res = createMockRes();
      const saveMock = jest.fn().mockResolvedValue({ _id: 'b1', limit: 400 });
      const existingBudget = { _id: 'b1', category: 'Food', limit: 300, month: '2026-07', save: saveMock };
      Budget.findOne.mockResolvedValue(existingBudget);

      await updateBudget(req, res);

      expect(existingBudget.limit).toBe(400);
      expect(saveMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ _id: 'b1', limit: 400 });
    });

    test('returns 404 when the budget does not exist for the user', async () => {
      const req = { params: { id: 'missing' }, user: { _id: 'user1' }, body: {} };
      const res = createMockRes();
      Budget.findOne.mockResolvedValue(null);

      await updateBudget(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteBudget', () => {
    test('deletes a budget belonging to the user', async () => {
      const req = { params: { id: 'b1' }, user: { _id: 'user1' } };
      const res = createMockRes();
      Budget.findOneAndDelete.mockResolvedValue({ _id: 'b1' });

      await deleteBudget(req, res);

      expect(Budget.findOneAndDelete).toHaveBeenCalledWith({ _id: 'b1', user: 'user1' });
      expect(res.json).toHaveBeenCalledWith({ message: 'Budget deleted successfully.' });
    });

    test('returns 404 when the budget is not found', async () => {
      const req = { params: { id: 'missing' }, user: { _id: 'user1' } };
      const res = createMockRes();
      Budget.findOneAndDelete.mockResolvedValue(null);

      await deleteBudget(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getBudgetSummary', () => {
    test('summarizes budgets for the requested month', async () => {
      const req = { user: { _id: 'user1' }, query: { month: '2026-07' } };
      const res = createMockRes();
      const budgets = [
        { category: 'Food', limit: 300, spent: 150, remaining: 150, percentUsed: 50, isExceeded: () => false },
        { category: 'Transport', limit: 100, spent: 120, remaining: 0, percentUsed: 100, isExceeded: () => true },
      ];
      Budget.find.mockResolvedValue(budgets);

      await getBudgetSummary(req, res);

      expect(Budget.find).toHaveBeenCalledWith({ user: 'user1', month: '2026-07' });
      expect(res.json).toHaveBeenCalledWith({
        month: '2026-07',
        budgets: [
          { category: 'Food', limit: 300, spent: 150, remaining: 150, percentUsed: 50, exceeded: false },
          { category: 'Transport', limit: 100, spent: 120, remaining: 0, percentUsed: 100, exceeded: true },
        ],
        totalLimit: 400,
        totalSpent: 270,
        totalRemaining: 130,
      });
    });

    test('defaults to the current month when none is provided', async () => {
      const req = { user: { _id: 'user1' }, query: {} };
      const res = createMockRes();
      Budget.find.mockResolvedValue([]);

      await getBudgetSummary(req, res);

      const expectedMonth = new Date().toISOString().slice(0, 7);
      expect(Budget.find).toHaveBeenCalledWith({ user: 'user1', month: expectedMonth });
    });
  });
});
