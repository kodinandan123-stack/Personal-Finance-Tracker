const {
    formatCurrency,
    parseCurrencyString,
    roundCurrency,
    convertCurrency,
    getCurrencySymbol,
    percentageChange,
} = require('../utils/currencyHelper');

describe('currencyHelper', () => {
    test('formatCurrency formats a number as USD by default', () => {
          expect(formatCurrency(1234.5)).toBe('$1,234.50');
    });

           test('formatCurrency returns 0.00 for invalid input', () => {
                 expect(formatCurrency('abc')).toBe('0.00');
                 expect(formatCurrency(NaN)).toBe('0.00');
           });

           test('formatCurrency supports other currencies and locales', () => {
                 expect(formatCurrency(1000, 'EUR', 'de-DE')).toContain('1.000,00');
           });

           test('parseCurrencyString parses formatted strings back to numbers', () => {
                 expect(parseCurrencyString('$1,234.56')).toBeCloseTo(1234.56);
                 expect(parseCurrencyString('1234.56')).toBeCloseTo(1234.56);
           });

           test('parseCurrencyString returns the number unchanged when given a number', () => {
                 expect(parseCurrencyString(42)).toBe(42);
           });

           test('parseCurrencyString returns NaN for invalid input', () => {
                 expect(parseCurrencyString(null)).toBeNaN();
                 expect(parseCurrencyString(undefined)).toBeNaN();
           });

           test('roundCurrency rounds to 2 decimals by default', () => {
                 expect(roundCurrency(1.005)).toBeCloseTo(1.01, 2);
                 expect(roundCurrency(2.345, 2)).toBeCloseTo(2.35, 2);
           });

           test('convertCurrency returns the same amount rounded when currencies match', () => {
                 expect(convertCurrency(50, 'USD', 'USD')).toBe(50);
           });

           test('convertCurrency converts using provided rates', () => {
                 const rates = { EUR: 0.9, GBP: 0.8 };
                 expect(convertCurrency(100, 'USD', 'EUR', rates)).toBeCloseTo(90);
                 expect(convertCurrency(90, 'EUR', 'USD', rates)).toBeCloseTo(100);
           });

           test('getCurrencySymbol returns the symbol for a known currency', () => {
                 expect(getCurrencySymbol('USD')).toBe('$');
           });

           test('getCurrencySymbol falls back to the currency code on error', () => {
                 expect(getCurrencySymbol('NOTACODE')).toBe('NOTACODE');
           });

           test('percentageChange calculates increase and decrease correctly', () => {
                 expect(percentageChange(150, 100)).toBeCloseTo(50);
                 expect(percentageChange(50, 100)).toBeCloseTo(-50);
           });

           test('percentageChange returns null when previous is zero', () => {
                 expect(percentageChange(100, 0)).toBeNull();
           });
});
