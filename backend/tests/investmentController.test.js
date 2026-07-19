jest.mock('../models/Investment');

const Investment = require('../models/Investment');
const {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  getPortfolioSummary,
} = require('../controllers/investmentController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('investmentController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInvestments', () => {
    test('returns the investments for the authenticated user sorted by newest first', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      const investments = [{ _id: 'i1' }, { _id: 'i2' }];
      const sortMock = jest.fn().mockResolvedValue(investments);
      Investment.find.mockReturnValue({ sort: sortMock });

      await getInvestments(req, res);

      expect(Investment.find).toHaveBeenCalledWith({ user: 'user1' });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, data: investments });
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Investment.find.mockImplementation(() => {
        throw new Error('db down');
      });

      await getInvestments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createInvestment', () => {
    test('returns 400 when required fields are missing', async () => {
      const req = { user: { id: 'user1' }, body: { name: 'Apple' } };
      const res = createMockRes();

      await createInvestment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(Investment.create).not.toHaveBeenCalled();
    });

    test('creates an investment defaulting currentPrice to purchasePrice', async () => {
      const req = {
        user: { id: 'user1' },
        body: { name: 'Apple', type: 'stock', ticker: 'AAPL', shares: 10, purchasePrice: 150 },
      };
      const res = createMockRes();
      const created = { _id: 'i1', ...req.body };
      Investment.create.mockResolvedValue(created);

      await createInvestment(req, res);

      expect(Investment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: 'user1',
          name: 'Apple',
          type: 'stock',
          ticker: 'AAPL',
          shares: 10,
          purchasePrice: 150,
          currentPrice: 150,
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: created });
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { id: 'user1' }, body: { name: 'Apple', type: 'stock', purchasePrice: 150 } };
      const res = createMockRes();
      Investment.create.mockRejectedValue(new Error('db down'));

      await createInvestment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateInvestment', () => {
    test('returns 404 when the investment does not exist', async () => {
      const req = { params: { id: 'i1' }, user: { id: 'user1' }, body: {} };
      const res = createMockRes();
      Investment.findById.mockResolvedValue(null);

      await updateInvestment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 403 when the investment belongs to a different user', async () => {
      const req = { params: { id: 'i1' }, user: { id: 'user1' }, body: {} };
      const res = createMockRes();
      Investment.findById.mockResolvedValue({ user: { toString: () => 'someoneElse' } });

      await updateInvestment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(Investment.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('updates only the allowed fields', async () => {
      const req = {
        params: { id: 'i1' },
        user: { id: 'user1' },
        body: { shares: 20, notes: 'Added more', unknownField: 'x' },
      };
      const res = createMockRes();
      const existing = { user: { toString: () => 'user1' } };
      const updated = { _id: 'i1', shares: 20, notes: 'Added more' };
      Investment.findById.mockResolvedValue(existing);
      Investment.findByIdAndUpdate.mockResolvedValue(updated);

      await updateInvestment(req, res);

      expect(Investment.findByIdAndUpdate).toHaveBeenCalledWith(
        'i1',
        { shares: 20, notes: 'Added more' },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: updated });
    });

    test('returns 500 when the database throws', async () => {
      const req = { params: { id: 'i1' }, user: { id: 'user1' }, body: {} };
      const res = createMockRes();
      Investment.findById.mockRejectedValue(new Error('db down'));

      await updateInvestment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteInvestment', () => {
    test('returns 404 when the investment does not exist', async () => {
      const req = { params: { id: 'i1' }, user: { id: 'user1' } };
      const res = createMockRes();
      Investment.findById.mockResolvedValue(null);

      await deleteInvestment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 403 when the investment belongs to a different user', async () => {
      const req = { params: { id: 'i1' }, user: { id: 'user1' } };
      const res = createMockRes();
      Investment.findById.mockResolvedValue({ user: { toString: () => 'someoneElse' } });

      await deleteInvestment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('deletes an investment belonging to the requesting user', async () => {
      const req = { params: { id: 'i1' }, user: { id: 'user1' } };
      const res = createMockRes();
      const deleteOneMock = jest.fn().mockResolvedValue({});
      Investment.findById.mockResolvedValue({ user: { toString: () => 'user1' }, deleteOne: deleteOneMock });

      await deleteInvestment(req, res);

      expect(deleteOneMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Investment removed' });
    });

    test('returns 500 when the database throws', async () => {
      const req = { params: { id: 'i1' }, user: { id: 'user1' } };
      const res = createMockRes();
      Investment.findById.mockRejectedValue(new Error('db down'));

      await deleteInvestment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getPortfolioSummary', () => {
    test('computes cost, current value, and gain/loss across holdings', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      const investments = [
        { _id: 'i1', name: 'Apple', type: 'stock', ticker: 'AAPL', shares: 10, purchasePrice: 100, currentPrice: 120 },
        { _id: 'i2', name: 'Bond Fund', type: 'bond', ticker: null, shares: null, purchasePrice: 500, currentPrice: null },
      ];
      Investment.find.mockResolvedValue(investments);

      await getPortfolioSummary(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.data.totalCost).toBe(1500);
      expect(payload.data.totalCurrentValue).toBe(1700);
      expect(payload.data.totalGainLoss).toBe(200);
      expect(payload.data.holdingsCount).toBe(2);
      expect(payload.data.holdings[0]).toEqual(
        expect.objectContaining({ gainLoss: 200, gainLossPct: 20 })
      );
    });

    test('avoids dividing by zero when total cost is zero', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Investment.find.mockResolvedValue([]);

      await getPortfolioSummary(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.data.totalGainLossPct).toBe(0);
      expect(payload.data.holdingsCount).toBe(0);
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Investment.find.mockRejectedValue(new Error('db down'));

      await getPortfolioSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
