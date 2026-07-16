const { notFound, errorHandler } = require('../middleware/errorMiddleware');

const createMockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn(() => res);
  res.headersSent = false;
  return res;
};

describe('notFound', () => {
  test('sets status to 404 and forwards an error to next', () => {
    const req = { originalUrl: '/api/unknown' };
    const res = createMockRes();
    const next = jest.fn();

       notFound(req, res, next);

       expect(res.statusCode).toBe(404);
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error.message).toContain('/api/unknown');
  });
});

describe('errorHandler', () => {
  const originalEnv = process.env.NODE_ENV;

         afterEach(() => {
           process.env.NODE_ENV = originalEnv;
         });

         test('delegates to next when headers are already sent', () => {
           const res = createMockRes();
           res.headersSent = true;
           const next = jest.fn();
           const err = new Error('boom');

              errorHandler(err, {}, res, next);

              expect(next).toHaveBeenCalledWith(err);
           expect(res.json).not.toHaveBeenCalled();
         });

         test('defaults to 500 when statusCode is 200', () => {
           const res = createMockRes();
           const next = jest.fn();
           const err = new Error('Something broke');

              errorHandler(err, {}, res, next);

              expect(res.status).toHaveBeenCalledWith(500);
           expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Something broke' }));
         });

         test('preserves an existing non-200 status code', () => {
           const res = createMockRes();
           res.statusCode = 403;
           const next = jest.fn();
           const err = new Error('Forbidden');

              errorHandler(err, {}, res, next);

              expect(res.status).toHaveBeenCalledWith(403);
         });

         test('returns 400 for Mongoose CastError on an ObjectId', () => {
           const res = createMockRes();
           const next = jest.fn();
           const err = { name: 'CastError', kind: 'ObjectId', message: 'Cast failed' };

              errorHandler(err, {}, res, next);

              expect(res.status).toHaveBeenCalledWith(400);
           expect(res.json).toHaveBeenCalledWith({ message: 'Invalid resource ID format' });
         });

         test('returns 400 with field messages for Mongoose ValidationError', () => {
           const res = createMockRes();
           const next = jest.fn();
           const err = {
             name: 'ValidationError',
             errors: {
               email: { message: 'Email is required' },
               amount: { message: 'Amount must be a number' },
             },
           };

              errorHandler(err, {}, res, next);

              expect(res.status).toHaveBeenCalledWith(400);
           expect(res.json).toHaveBeenCalledWith({
             message: 'Validation failed',
             errors: ['Email is required', 'Amount must be a number'],
           });
         });

         test('returns 400 for a duplicate key error naming the offending field', () => {
           const res = createMockRes();
           const next = jest.fn();
           const err = { code: 11000, keyValue: { email: 'dup@example.com' } };

              errorHandler(err, {}, res, next);

              expect(res.status).toHaveBeenCalledWith(400);
           expect(res.json).toHaveBeenCalledWith({ message: 'Duplicate value for field: email' });
         });

         test('returns 401 for an invalid JWT', () => {
           const res = createMockRes();
           const next = jest.fn();
           const err = { name: 'JsonWebTokenError', message: 'jwt malformed' };

              errorHandler(err, {}, res, next);

              expect(res.status).toHaveBeenCalledWith(401);
           expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
         });

         test('returns 401 for an expired JWT', () => {
           const res = createMockRes();
           const next = jest.fn();
           const err = { name: 'TokenExpiredError', message: 'jwt expired' };

              errorHandler(err, {}, res, next);

              expect(res.status).toHaveBeenCalledWith(401);
           expect(res.json).toHaveBeenCalledWith({ message: 'Token has expired, please log in again' });
         });

         test('includes the stack trace when NODE_ENV is development', () => {
           process.env.NODE_ENV = 'development';
           const res = createMockRes();
           const next = jest.fn();
           const err = new Error('Dev error');

              errorHandler(err, {}, res, next);

              const payload = res.json.mock.calls[0][0];
           expect(payload.stack).toBeDefined();
         });

         test('omits the stack trace when NODE_ENV is production', () => {
           process.env.NODE_ENV = 'production';
           const res = createMockRes();
           const next = jest.fn();
           const err = new Error('Prod error');

              errorHandler(err, {}, res, next);

              const payload = res.json.mock.calls[0][0];
           expect(payload.stack).toBeUndefined();
         });
});
