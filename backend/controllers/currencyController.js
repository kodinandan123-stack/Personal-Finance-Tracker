const axios = require('axios');

// Supported fiat currencies
const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN',
  'BRL', 'KRW', 'SGD', 'HKD', 'NOK', 'SEK', 'DKK', 'NZD', 'ZAR', 'RUB',
];

/**
 * @desc    Get list of supported currencies
 * @route   GET /api/currency/supported
 * @access  Private
 */
const getSupportedCurrencies = async (req, res) => {
  try {
    res.json({
            success: true,
            count: SUPPORTED_CURRENCIES.length,
            currencies: SUPPORTED_CURRENCIES,
      });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Convert an amount from one currency to another
 * @route   GET /api/currency/convert?from=USD&to=EUR&amount=100
   * @access  Private
   */
const convertCurrency = async (req, res) => {
  try {
    const { from = 'USD', to = 'EUR', amount } = req.query;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid positive amount is required.' });
    }

    const fromCurrency = from.toUpperCase();
    const toCurrency = to.toUpperCase();

    if (!SUPPORTED_CURRENCIES.includes(fromCurrency)) {
      return res.status(400).json({ message: `Unsupported source currency: ${fromCurrency}` });
}
    if (!SUPPORTED_CURRENCIES.includes(toCurrency)) {
      return res.status(400).json({ message: `Unsupported target currency: ${toCurrency}` });
}
    if (fromCurrency === toCurrency) {
      return res.json({
        success: true,
        from: fromCurrency,
        to: toCurrency,
        amount: Number(amount),
        convertedAmount: Number(amount),
        rate: 1,
        timestamp: new Date().toISOString(),
});
}

    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'Currency conversion service not configured.' });
}

    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}/${amount}`;
    const { data } = await axios.get(url, { timeout: 5000 });

    if (data.result !== 'success') {
      return res.status(502).json({ message: 'Failed to fetch exchange rate.', detail: data['error-type'] });
}

    res.json({
      success: true,
      from: fromCurrency,
      to: toCurrency,
      amount: Number(amount),
      convertedAmount: data.conversion_result,
      rate: data.conversion_rate,
      timestamp: new Date().toISOString(),
});
} catch (error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ message: 'Currency API request timed out.' });
}
    res.status(500).json({ message: 'Server error', error: error.message });
}
};

/**
 * @desc    Get exchange rates for a base currency against all supported currencies
 * @route   GET /api/currency/rates?base=USD
 * @access  Private
 */
const getExchangeRates = async (req, res) => {
  try {
    const { base = 'USD' } = req.query;
    const baseCurrency = base.toUpperCase();

    if (!SUPPORTED_CURRENCIES.includes(baseCurrency)) {
      return res.status(400).json({ message: `Unsupported base currency: ${baseCurrency}` });
}

    const apiKey = process.env.EXCHANGE_RATE_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'Currency conversion service not configured.' });
}

    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`;
    const { data } = await axios.get(url, { timeout: 5000 });

    if (data.result !== 'success') {
      return res.status(502).json({ message: 'Failed to fetch exchange rates.', detail: data['error-type'] });
}

    // Filter to only our supported currencies
    const filteredRates = {};
    SUPPORTED_CURRENCIES.forEach((currency) => {
      if (data.conversion_rates[currency] !== undefined) {
        filteredRates[currency] = data.conversion_rates[currency];
}
});

    res.json({
      success: true,
      base: baseCurrency,
      rates: filteredRates,
      lastUpdated: data.time_last_update_utc,
      nextUpdate: data.time_next_update_utc,
});
} catch (error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ message: 'Currency API request timed out.' });
}
    res.status(500).json({ message: 'Server error', error: error.message });
}
};

module.exports = { getSupportedCurrencies, convertCurrency, getExchangeRates };
