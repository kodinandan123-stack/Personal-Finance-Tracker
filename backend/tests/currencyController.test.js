jest.mock('axios');

const axios = require('axios');
const {
  getSupportedCurrencies,
  convertCurrency,
  getExchangeRates,
} = require('../controllers/currencyController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('currencyController', () => {
  const originalApiKey = process.env.EXCHANGE_RATE_API_KEY;

  afterEach(() => {
    jest.clearAllMocks();
    process.env.EXCHANGE_RATE_API_KEY = originalApiKey;
  });

  describe('getSupportedCurrencies', () => {
    test('returns the list of supported currencies', async () => {
      const req = {};
      const res = createMockRes();

      await getSupportedCurrencies(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.success).toBe(true);
      expect(payload.currencies).toContain('USD');
      expect(payload.count).toBe(payload.currencies.length);
    });
  });

  describe('convertCurrency', () => {
    test('returns 400 when amount is missing or invalid', async () => {
      const req = { query: { from: 'USD', to: 'EUR', amount: '-5' } };
      const res = createMockRes();

      await convertCurrency(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 400 for an unsupported source currency', async () => {
      const req = { query: { from: 'XXX', to: 'EUR', amount: '100' } };
      const res = createMockRes();

      await convertCurrency(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unsupported source currency: XXX' });
    });

    test('returns 400 for an unsupported target currency', async () => {
      const req = { query: { from: 'USD', to: 'XXX', amount: '100' } };
      const res = createMockRes();

      await convertCurrency(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unsupported target currency: XXX' });
    });

    test('short-circuits with rate 1 when converting to the same currency', async () => {
      const req = { query: { from: 'USD', to: 'usd', amount: '50' } };
      const res = createMockRes();

      await convertCurrency(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.rate).toBe(1);
      expect(payload.convertedAmount).toBe(50);
      expect(axios.get).not.toHaveBeenCalled();
    });

    test('returns 503 when the API key is not configured', async () => {
      delete process.env.EXCHANGE_RATE_API_KEY;
      const req = { query: { from: 'USD', to: 'EUR', amount: '100' } };
      const res = createMockRes();

      await convertCurrency(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
    });

    test('returns the converted amount on a successful API call', async () => {
      process.env.EXCHANGE_RATE_API_KEY = 'test-key';
      const req = { query: { from: 'USD', to: 'EUR', amount: '100' } };
      const res = createMockRes();
      axios.get.mockResolvedValue({
        data: { result: 'success', conversion_result: 91.5, conversion_rate: 0.915 },
      });

      await convertCurrency(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, convertedAmount: 91.5, rate: 0.915 })
      );
    });

    test('returns 502 when the API responds with a failure result', async () => {
      process.env.EXCHANGE_RATE_API_KEY = 'test-key';
      const req = { query: { from: 'USD', to: 'EUR', amount: '100' } };
      const res = createMockRes();
      axios.get.mockResolvedValue({ data: { result: 'error', 'error-type': 'invalid-key' } });

      await convertCurrency(req, res);

      expect(res.status).toHaveBeenCalledWith(502);
    });

    test('returns 504 when the request times out', async () => {
      process.env.EXCHANGE_RATE_API_KEY = 'test-key';
      const req = { query: { from: 'USD', to: 'EUR', amount: '100' } };
      const res = createMockRes();
      const timeoutError = new Error('timeout');
      timeoutError.code = 'ECONNABORTED';
      axios.get.mockRejectedValue(timeoutError);

      await convertCurrency(req, res);

      expect(res.status).toHaveBeenCalledWith(504);
    });
  });

  describe('getExchangeRates', () => {
    test('returns 400 for an unsupported base currency', async () => {
      const req = { query: { base: 'XXX' } };
      const res = createMockRes();

      await getExchangeRates(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 503 when the API key is not configured', async () => {
      delete process.env.EXCHANGE_RATE_API_KEY;
      const req = { query: { base: 'USD' } };
      const res = createMockRes();

      await getExchangeRates(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
    });

    test('returns filtered exchange rates on success', async () => {
      process.env.EXCHANGE_RATE_API_KEY = 'test-key';
      const req = { query: { base: 'USD' } };
      const res = createMockRes();
      axios.get.mockResolvedValue({
        data: {
          result: 'success',
          conversion_rates: { EUR: 0.9, GBP: 0.8, ZZZ: 5 },
          time_last_update_utc: 'Mon, 01 Jan 2026',
          time_next_update_utc: 'Tue, 02 Jan 2026',
        },
      });

      await getExchangeRates(req, res);

      const payload = res.json.mock.calls[0][0];
      expect(payload.rates).toEqual({ EUR: 0.9, GBP: 0.8 });
      expect(payload.rates.ZZZ).toBeUndefined();
    });

    test('returns 500 when an unexpected error occurs', async () => {
      process.env.EXCHANGE_RATE_API_KEY = 'test-key';
      const req = { query: { base: 'USD' } };
      const res = createMockRes();
      axios.get.mockRejectedValue(new Error('boom'));

      await getExchangeRates(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
