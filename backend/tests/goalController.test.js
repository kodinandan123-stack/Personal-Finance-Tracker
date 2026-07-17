jest.mock('../models/Goal');

const Goal = require('../models/Goal');
const { getGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('goalController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGoals', () => {
    test('returns the goals for the authenticated user sorted by newest first', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      const goals = [{ _id: 'g1' }, { _id: 'g2' }];
      const sortMock = jest.fn().mockResolvedValue(goals);
      Goal.find.mockReturnValue({ sort: sortMock });

      await getGoals(req, res);

      expect(Goal.find).toHaveBeenCalledWith({ user: 'user1' });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(goals);
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { id: 'user1' } };
      const res = createMockRes();
      Goal.find.mockImplementation(() => {
        throw new Error('db down');
      });

      await getGoals(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createGoal', () => {
    test('creates a goal when name and targetAmount are provided', async () => {
      const req = { user: { id: 'user1' }, body: { name: 'Emergency Fund', targetAmount: 5000 } };
      const res = createMockRes();
      const created = { _id: 'g1', ...req.body };
      Goal.create.mockResolvedValue(created);

      await createGoal(req, res);

      expect(Goal.create).toHaveBeenCalledWith({
        user: 'user1',
        name: 'Emergency Fund',
        targetAmount: 5000,
        deadline: null,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
    });

    test('returns 400 when name or targetAmount is missing', async () => {
      const req = { user: { id: 'user1' }, body: { name: 'Emergency Fund' } };
      const res = createMockRes();

      await createGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(Goal.create).not.toHaveBeenCalled();
    });
  });

  describe('updateGoal', () => {
    test('marks the goal completed when savedAmount reaches the target', async () => {
      const req = {
        params: { id: 'g1' },
        user: { id: 'user1' },
        body: { savedAmount: 5000 },
      };
      const res = createMockRes();
      const existingGoal = { _id: 'g1', user: { toString: () => 'user1' }, targetAmount: 5000 };
      const updatedGoal = { _id: 'g1', savedAmount: 5000, isCompleted: true };
      Goal.findById.mockResolvedValue(existingGoal);
      Goal.findByIdAndUpdate.mockResolvedValue(updatedGoal);

      await updateGoal(req, res);

      expect(req.body.isCompleted).toBe(true);
      expect(Goal.findByIdAndUpdate).toHaveBeenCalledWith('g1', req.body, { new: true, runValidators: true });
      expect(res.json).toHaveBeenCalledWith(updatedGoal);
    });

    test('returns 403 when the goal does not belong to the requesting user', async () => {
      const req = { params: { id: 'g1' }, user: { id: 'user1' }, body: {} };
      const res = createMockRes();
      const existingGoal = { _id: 'g1', user: { toString: () => 'someoneElse' } };
      Goal.findById.mockResolvedValue(existingGoal);

      await updateGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(Goal.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test('returns 404 when the goal does not exist', async () => {
      const req = { params: { id: 'missing' }, user: { id: 'user1' }, body: {} };
      const res = createMockRes();
      Goal.findById.mockResolvedValue(null);

      await updateGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteGoal', () => {
    test('deletes a goal belonging to the requesting user', async () => {
      const req = { params: { id: 'g1' }, user: { id: 'user1' } };
      const res = createMockRes();
      const deleteOneMock = jest.fn().mockResolvedValue({});
      const existingGoal = { _id: 'g1', user: { toString: () => 'user1' }, deleteOne: deleteOneMock };
      Goal.findById.mockResolvedValue(existingGoal);

      await deleteGoal(req, res);

      expect(deleteOneMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Goal removed' });
    });

    test('returns 403 when the goal belongs to a different user', async () => {
      const req = { params: { id: 'g1' }, user: { id: 'user1' } };
      const res = createMockRes();
      const existingGoal = { _id: 'g1', user: { toString: () => 'someoneElse' } };
      Goal.findById.mockResolvedValue(existingGoal);

      await deleteGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('returns 404 when the goal does not exist', async () => {
      const req = { params: { id: 'missing' }, user: { id: 'user1' } };
      const res = createMockRes();
      Goal.findById.mockResolvedValue(null);

      await deleteGoal(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
