jest.mock('mongoose', () => ({
  connection: {
    readyState: 1,
  },
}));

const mongoose = require('mongoose');
const { getHealth } = require('../controllers/healthController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('getHealth controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns 200 with status ok when database is connected', () => {
    mongoose.connection.readyState = 1;
    const req = {};
    const res = createMockRes();

    getHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0][0];
    expect(payload.status).toBe('ok');
    expect(payload.services.database).toBe('connected');
  });

  test('returns 503 with status degraded when database is disconnected', () => {
    mongoose.connection.readyState = 0;
    const req = {};
    const res = createMockRes();

    getHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    const payload = res.json.mock.calls[0][0];
    expect(payload.status).toBe('degraded');
    expect(payload.services.database).toBe('disconnected');
  });

  test('includes uptime and a valid ISO timestamp in the payload', () => {
    mongoose.connection.readyState = 1;
    const req = {};
    const res = createMockRes();

    getHealth(req, res);

    const payload = res.json.mock.calls[0][0];
    expect(typeof payload.uptime).toBe('number');
    expect(new Date(payload.timestamp).toISOString()).toBe(payload.timestamp);
  });

  test('treats connecting state (2) as disconnected/degraded', () => {
    mongoose.connection.readyState = 2;
    const req = {};
    const res = createMockRes();

    getHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'degraded', services: { database: 'disconnected' } })
    );
  });
});
