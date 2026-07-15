const EventEmitter = require('events');
const requestLogger = require('../middleware/requestLogger');

describe('requestLogger', () => {
    let consoleSpy;

           beforeEach(() => {
                 consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
           });

           afterEach(() => {
                 consoleSpy.mockRestore();
           });

           const createMockRes = (statusCode) => {
                 const res = new EventEmitter();
                 res.statusCode = statusCode;
                 return res;
           };

           test('calls next() immediately', () => {
                 const req = { method: 'GET', originalUrl: '/api/test' };
                 const res = createMockRes(200);
                 const next = jest.fn();

                    requestLogger(req, res, next);

                    expect(next).toHaveBeenCalledTimes(1);
           });

           test('logs the request details when the response finishes', () => {
                 const req = { method: 'GET', originalUrl: '/api/transactions' };
                 const res = createMockRes(200);
                 const next = jest.fn();

                    requestLogger(req, res, next);
                 res.emit('finish');

                    expect(consoleSpy).toHaveBeenCalledTimes(1);
                 const logMessage = consoleSpy.mock.calls[0][0];
                 expect(logMessage).toContain('GET');
                 expect(logMessage).toContain('/api/transactions');
           });

           test('falls back to req.url when originalUrl is not set', () => {
                 const req = { method: 'POST', url: '/fallback' };
                 const res = createMockRes(201);
                 const next = jest.fn();

                    requestLogger(req, res, next);
                 res.emit('finish');

                    expect(consoleSpy.mock.calls[0][0]).toContain('/fallback');
           });

           test('colour-codes 4xx and 5xx responses differently from 2xx', () => {
                 const req = { method: 'GET', originalUrl: '/error' };

                    const resOk = createMockRes(200);
                 requestLogger(req, resOk, jest.fn());
                 resOk.emit('finish');

                    const resError = createMockRes(500);
                 requestLogger(req, resError, jest.fn());
                 resError.emit('finish');

                    const okLog = consoleSpy.mock.calls[0][0];
                 const errorLog = consoleSpy.mock.calls[1][0];
                 expect(okLog).not.toBe(errorLog);
           });
});
