import { useState, useCallback } from 'react';

/**
 * Supported currency configurations.
 * Each entry maps a currency code to its symbol, locale, and decimal places.
 */
const CURRENCY_CONFIG = {
  USD: { symbol: '$', locale: 'en-US', decimals: 2 },
  EUR: { symbol: '\u20AC', locale: 'de-DE', decimals: 2 },
  GBP: { symbol: '\u00A3', locale: 'en-GB', decimals: 2 },
  JPY: { symbol: '\u00A5', locale: 'ja-JP', decimals: 0 },
  INR: { symbol: '\u20B9', locale: 'en-IN', decimals: 2 },
  CAD: { symbol: 'CA$', locale: 'en-CA', decimals: 2 },
  AUD: { symbol: 'A$', locale: 'en-AU', decimals: 2 },
  CHF: { symbol: 'Fr', locale: 'de-CH', decimals: 2 },
};

/**
 * useCurrency hook
 *
 * Provides formatting helpers for monetary values.
 * The selected currency persists to localStorage so the user's preference
 * is remembered across page reloads.
 *
 * Usage:
 *   const { currency, setCurrency, format, formatCompact } = useCurrency();
 *   format(1234.5)         // => '$1,234.50'
 *   formatCompact(1234567) // => '$1.23M'
 */
export function useCurrency(defaultCurrency = 'USD') {
  const stored = localStorage.getItem('preferredCurrency');
  const initial = CURRENCY_CONFIG[stored] ? stored : defaultCurrency;

  const [currency, setCurrencyState] = useState(initial);

  const setCurrency = useCallback((code) => {
    if (!CURRENCY_CONFIG[code]) {
      console.warn('[useCurrency] Unknown currency code:', code);
      return;
    }
    localStorage.setItem('preferredCurrency', code);
    setCurrencyState(code);
  }, []);

  /**
   * Format a number as a full currency string.
   * e.g. format(1234.5) => '$1,234.50'
   */
  const format = useCallback(
    (amount) => {
      const config = CURRENCY_CONFIG[currency];
      try {
        return new Intl.NumberFormat(config.locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: config.decimals,
          maximumFractionDigits: config.decimals,
        }).format(amount);
      } catch {
        // Fallback for environments without full Intl support
        return config.symbol + Number(amount).toFixed(config.decimals);
      }
    },
    [currency]
  );

  /**
   * Format large numbers in compact notation.
   * e.g. formatCompact(1234567) => '$1.23M'
   */
  const formatCompact = useCallback(
    (amount) => {
      const config = CURRENCY_CONFIG[currency];
      try {
        return new Intl.NumberFormat(config.locale, {
          style: 'currency',
          currency,
          notation: 'compact',
          compactDisplay: 'short',
          maximumFractionDigits: 2,
        }).format(amount);
      } catch {
        return format(amount);
      }
    },
    [currency, format]
  );

  return {
    currency,
    setCurrency,
    format,
    formatCompact,
    availableCurrencies: Object.keys(CURRENCY_CONFIG),
    currencySymbol: CURRENCY_CONFIG[currency]?.symbol ?? '$',
  };
}

export default useCurrency;
