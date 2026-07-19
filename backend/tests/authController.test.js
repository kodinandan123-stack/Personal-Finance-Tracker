jest.mock('../models/User');
jest.mock('jsonwebtoken');
jest.mock('express-validator');

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { registerUser, loginUser, getMe, updateProfile, changePassword } = require('../controllers/authController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const noValidationErrors = () => ({ isEmpty: () => true, array: () => [] });
const withValidationErrors = (errors) => ({ isEmpty: () => false, array: () => errors });

describe('authController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    test('returns 400 when validation fails', async () => {
      const req = { body: {} };
      const res = createMockRes();
      validationResult.mockReturnValue(withValidationErrors([{ msg: 'Name is required' }]));

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(User.findOne).not.toHaveBeenCalled();
    });

    test('returns 400 when a user with the given email already exists', async () => {
      const req = { body: { name: 'Alice', email: 'alice@example.com', password: 'secret123' } };
      const res = createMockRes();
      validationResult.mockReturnValue(noValidationErrors());
      User.findOne.mockResolvedValue({ _id: 'u1' });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists with this email' });
      expect(User.create).not.toHaveBeenCalled();
    });

    test('creates the user and returns a token on success', async () => {
      const req = { body: { name: 'Alice', email: 'alice@example.com', password: 'secret123' } };
      const res = createMockRes();
      validationResult.mockReturnValue(noValidationErrors());
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ _id: 'u1', name: 'Alice', email: 'alice@example.com' });
      jwt.sign.mockReturnValue('signed-token');

      await registerUser(req, res);

      expect(User.create).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        token: 'signed-token',
      });
    });

    test('returns 500 when the database throws', async () => {
      const req = { body: { name: 'Alice', email: 'alice@example.com', password: 'secret123' } };
      const res = createMockRes();
      validationResult.mockReturnValue(noValidationErrors());
      User.findOne.mockRejectedValue(new Error('db down'));

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('loginUser', () => {
    test('returns 400 when validation fails', async () => {
      const req = { body: {} };
      const res = createMockRes();
      validationResult.mockReturnValue(withValidationErrors([{ msg: 'Email is required' }]));

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(User.findOne).not.toHaveBeenCalled();
    });

    test('returns 401 when the user cannot be found', async () => {
      const req = { body: { email: 'missing@example.com', password: 'secret123' } };
      const res = createMockRes();
      validationResult.mockReturnValue(noValidationErrors());
      const selectMock = jest.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({ select: selectMock });

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });

    test('returns 401 when the password does not match', async () => {
      const req = { body: { email: 'alice@example.com', password: 'wrong' } };
      const res = createMockRes();
      validationResult.mockReturnValue(noValidationErrors());
      const user = { _id: 'u1', matchPassword: jest.fn().mockResolvedValue(false) };
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('returns a token when credentials are valid', async () => {
      const req = { body: { email: 'alice@example.com', password: 'secret123' } };
      const res = createMockRes();
      validationResult.mockReturnValue(noValidationErrors());
      const user = {
        _id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
      jwt.sign.mockReturnValue('signed-token');

      await loginUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        _id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        token: 'signed-token',
      });
    });

    test('returns 500 when the database throws', async () => {
      const req = { body: { email: 'alice@example.com', password: 'secret123' } };
      const res = createMockRes();
      validationResult.mockReturnValue(noValidationErrors());
      User.findOne.mockImplementation(() => {
        throw new Error('db down');
      });

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getMe', () => {
    test('returns the profile of the logged-in user', async () => {
      const req = { user: { _id: 'u1' } };
      const res = createMockRes();
      const user = { _id: 'u1', name: 'Alice', email: 'alice@example.com', createdAt: '2026-01-01' };
      User.findById.mockResolvedValue(user);

      await getMe(req, res);

      expect(User.findById).toHaveBeenCalledWith('u1');
      expect(res.json).toHaveBeenCalledWith({
        _id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-01-01',
      });
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { _id: 'u1' } };
      const res = createMockRes();
      User.findById.mockRejectedValue(new Error('db down'));

      await getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateProfile', () => {
    test('returns 404 when the user does not exist', async () => {
      const req = { user: { _id: 'u1' }, body: { name: 'Alice' } };
      const res = createMockRes();
      User.findById.mockResolvedValue(null);

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 400 when the new email is already in use', async () => {
      const req = { user: { _id: 'u1' }, body: { email: 'taken@example.com' } };
      const res = createMockRes();
      const user = { _id: 'u1', email: 'alice@example.com', save: jest.fn() };
      User.findById.mockResolvedValue(user);
      User.findOne.mockResolvedValue({ _id: 'u2', email: 'taken@example.com' });

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(user.save).not.toHaveBeenCalled();
    });

    test('updates the name and email and returns the updated profile', async () => {
      const req = { user: { _id: 'u1' }, body: { name: 'Alice B', email: 'aliceb@example.com' } };
      const res = createMockRes();
      const user = {
        _id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        createdAt: '2026-01-01',
        save: jest.fn(),
      };
      User.findById.mockResolvedValue(user);
      User.findOne.mockResolvedValue(null);
      user.save.mockResolvedValue({
        _id: 'u1',
        name: 'Alice B',
        email: 'aliceb@example.com',
        createdAt: '2026-01-01',
      });

      await updateProfile(req, res);

      expect(user.name).toBe('Alice B');
      expect(user.email).toBe('aliceb@example.com');
      expect(res.json).toHaveBeenCalledWith({
        _id: 'u1',
        name: 'Alice B',
        email: 'aliceb@example.com',
        createdAt: '2026-01-01',
      });
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { _id: 'u1' }, body: { name: 'Alice' } };
      const res = createMockRes();
      User.findById.mockRejectedValue(new Error('db down'));

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('changePassword', () => {
    test('returns 400 when currentPassword or newPassword is missing', async () => {
      const req = { user: { _id: 'u1' }, body: { currentPassword: 'old123' } };
      const res = createMockRes();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(User.findById).not.toHaveBeenCalled();
    });

    test('returns 400 when the new password is too short', async () => {
      const req = { user: { _id: 'u1' }, body: { currentPassword: 'old123', newPassword: '123' } };
      const res = createMockRes();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 404 when the user does not exist', async () => {
      const req = { user: { _id: 'u1' }, body: { currentPassword: 'old123', newPassword: 'newpass123' } };
      const res = createMockRes();
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 401 when the current password is incorrect', async () => {
      const req = { user: { _id: 'u1' }, body: { currentPassword: 'wrong', newPassword: 'newpass123' } };
      const res = createMockRes();
      const user = { matchPassword: jest.fn().mockResolvedValue(false) };
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('updates the password on success', async () => {
      const req = { user: { _id: 'u1' }, body: { currentPassword: 'old123', newPassword: 'newpass123' } };
      const res = createMockRes();
      const user = { matchPassword: jest.fn().mockResolvedValue(true), save: jest.fn().mockResolvedValue({}) };
      User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

      await changePassword(req, res);

      expect(user.password).toBe('newpass123');
      expect(user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Password updated successfully' });
    });

    test('returns 500 when the database throws', async () => {
      const req = { user: { _id: 'u1' }, body: { currentPassword: 'old123', newPassword: 'newpass123' } };
      const res = createMockRes();
      User.findById.mockImplementation(() => {
        throw new Error('db down');
      });

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
