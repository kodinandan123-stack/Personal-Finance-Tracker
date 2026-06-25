/**
 * currencyHelper.js
   * Utility functions for currency formatting, conversion, and parsing
 * used across the Personal Finance Tracker backend.
   */

const DEFAULT_CURRENCY = 'USD';
const DEFAULT_LOCALE = 'en-US';

/**
 * Format a numeric amount into a currency string.
   * @param {number} amount - The amount to format.
   * @param {string} currency - ISO 4217 currency code (default: 'USD').
   * @param {string} locale - BCP 47 locale string (default: 'en-US').
   * @returns {string} Formatted currency string, e.g. '$1,234.56'.
   */
const formatCurrency = (amount, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0.00';
  }
  return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Parse a currency string back to a number.
   * Strips common currency symbols and commas.
   * @param {string} value - The string to parse (e.g. '$1,234.56' or '1234.56').
   * @returns {number} Parsed numeric value or NaN if invalid.
 */
const parseCurrencyString = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;
  // Remove currency symbols, spaces, and commas
  const cleaned = value.replace(/[^0-9.-]/g, '');
      return parseFloat(cleaned);
};

/**
 * Round a number to a given number of decimal places (default: 2).
 * Uses symmetric rounding to avoid floating-point bias.
 * @param {number} amount
 * @param {number} decimals
 * @returns {number}
 */
const roundCurrency = (amount, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round((amount + Number.EPSILON) * factor) / factor;
};

/**
 * Convert an amount from one currency to another using a static rates map.
 * For production use, replace with a live exchange-rate API integration.
 *
 * @param {number} amount - Amount in the source currency.
 * @param {string} fromCurrency - Source ISO 4217 code.
 * @param {string} toCurrency - Target ISO 4217 code.
 * @param {Object} rates - Exchange rates relative to USD (e.g. { EUR: 0.92, GBP: 0.79 }).
 * @returns {number} Converted amount rounded to 2 decimal places.
 */
const convertCurrency = (amount, fromCurrency, toCurrency, rates = {}) => {
  if (fromCurrency === toCurrency) return roundCurrency(amount);

  // Convert to USD first as the base currency
  const toUSD =
    fromCurrency === 'USD' ? amount : amount / (rates[fromCurrency] || 1);

  // Then convert from USD to target
  const converted =
    toCurrency === 'USD' ? toUSD : toUSD * (rates[toCurrency] || 1);

  return roundCurrency(converted);
};

/**
 * Return the currency symbol for a given ISO 4217 code.
 * Falls back to the code itself if the symbol cannot be resolved.
 * @param {string} currency - ISO 4217 currency code.
 * @param {string} locale
 * @returns {string}
 */
const getCurrencySymbol = (currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) => {
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
}).format(0);
    // Extract non-digit, non-space characters that form the symbol
    return formatted.replace(/[\d,. ]/g, '').trim() || currency;
} catch {
    return currency;
}
};

/**
 * Calculate the percentage change between two amounts.
 * Returns null when the previous amount is zero to avoid division errors.
 * @param {number} current
 * @param {number} previous
 * @returns {number|null}
 */
const percentageChange = (current, previous) => {
  if (previous === 0) return null;
  return roundCurrency(((current - previous) / Math.abs(previous)) * 100);
};

module.exports = {
  formatCurrency,
  parseCurrencyString,
  roundCurrency,
  convertCurrency,
  getCurrencySymbol,
  percentageChange,
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
};
