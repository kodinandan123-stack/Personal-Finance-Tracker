jest.mock('jsonwebtoken');
jest.mock('../models/User');

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('protect middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

         test('returns 401 when no authorization header is present', async () => {
           const req = { headers: {} };
           const res = createMockRes();
           const next = jest.fn();

              await protect(req, res, next);

              expect(res.status).toHaveBeenCalledWith(401);
           expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
           expect(next).not.toHaveBeenCalled();
         });

         test('returns 401 when authorization header does not start with Bearer', async () => {
           const req = { headers: { authorization: 'Basic abc123' } };
           const res = createMockRes();
           const next = jest.fn();

              await protect(req, res, next);

              expect(res.status).toHaveBeenCalledWith(401);
           expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
           expect(next).not.toHaveBeenCalled();
         });

         test('attaches the user to the request and calls next on a valid token', async () => {
           const req = { headers: { authorization: 'Bearer valid.token.here' } };
           const res = createMockRes();
           const next = jest.fn();
           const mockUser = { _id: 'user123', name: 'Alex' };

              jwt.verify.mockReturnValue({ id: 'user123' });
           User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

              await protect(req, res, next);

              expect(jwt.verify).toHaveBeenCalledWith('valid.token.here', process.env.JWT_SECRET);
           expect(User.findById).toHaveBeenCalledWith('user123');
           expect(req.user).toEqual(mockUser);
           expect(next).toHaveBeenCalledTimes(1);
         });

         test('returns 401 when the decoded user no longer exists', async () => {
           const req = { headers: { authorization: 'Bearer valid.token.here' } };
           const res = createMockRes();
           const next = jest.fn();

              jwt.verify.mockReturnValue({ id: 'missing-user' });
           User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

              await protect(req, res, next);

              expect(res.status).toHaveBeenCalledWith(401);
           expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
           expect(next).not.toHaveBeenCalled();
         });

         test('returns 401 when token verification throws', async () => {
           const req = { headers: { authorization: 'Bearer invalid.token' } };
           const res = createMockRes();
           const next = jest.fn();

              jwt.verify.mockImplementation(() => {
                throw new Error('invalid signature');
              });

              await protect(req, res, next);

              expect(res.status).toHaveBeenCalledWith(401);
           expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
           expect(next).not.toHaveBeenCalled();
         });

         test('excludes the password field when fetching the user', async () => {
           const req = { headers: { authorization: 'Bearer valid.token.here' } };
           const res = createMockRes();
           const next = jest.fn();
           const selectMock = jest.fn().mockResolvedValue({ _id: 'user123' });

              jwt.verify.mockReturnValue({ id: 'user123' });
           User.findById.mockReturnValue({ select: selectMock });

              await protect(req, res, next);

              expect(selectMock).toHaveBeenCalledWith('-password');
         });
});
