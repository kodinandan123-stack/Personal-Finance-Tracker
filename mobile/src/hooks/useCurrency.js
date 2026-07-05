import { useState, useCallback } from 'react'

/**
   * Mobile port of the web app's useCurrency hook
   * (frontend/src/hooks/useCurrency.js).
   *
   * Provides formatting helpers for monetary values. Unlike the web
   * version, preference persistence uses in-memory state for now; wiring
   * this up to AsyncStorage (or the user's saved profile preference from
   * the API) can be done once the Profile screen is built.
   *
   * Usage:
   *   const { currency, setCurrency, format, formatCompact } = useCurrency()
   *   format(1234.5) // => '$1,234.50'
   *   formatCompact(1234567) // => '$1.23M'
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
}

export function useCurrency(defaultCurrency = 'USD') {
    const [currency, setCurrencyState] = useState(defaultCurrency)

  const setCurrency = useCallback((code) => {
        if (!CURRENCY_CONFIG[code]) {
                console.warn('[useCurrency] Unknown currency code:', code)
                return
        }
        setCurrencyState(code)
  }, [])

  const format = useCallback(
        (amount) => {
                const config = CURRENCY_CONFIG[currency]
                try {
                          return new Intl.NumberFormat(config.locale, {
                                      style: 'currency',
                                      currency,
                                      minimumFractionDigits: config.decimals,
                                      maximumFractionDigits: config.decimals,
                          }).format(amount)
                } catch {
                          return config.symbol + Number(amount).toFixed(config.decimals)
                }
        },
        [currency]
      )

  const formatCompact = useCallback(
        (amount) => {
                const config = CURRENCY_CONFIG[currency]
                try {
                          return new Intl.NumberFormat(config.locale, {
                                      style: 'currency',
                                      currency,
                                      notation: 'compact',
                                      compactDisplay: 'short',
                                      maximumFractionDigits: 2,
                          }).format(amount)
                } catch {
                          return format(amount)
                }
        },
        [currency, format]
      )

  return {
        currency,
        setCurrency,
        format,
        formatCompact,
        availableCurrencies: Object.keys(CURRENCY_CONFIG),
        currencySymbol: CURRENCY_CONFIG[currency]?.symbol ?? '$',
  }
}

export default useCurrency
