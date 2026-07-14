const {
  isValidAmount,
  isValidEmail,
  isValidTransactionType,
  isNonEmptyString,
  isValidObjectId,
  isValidDate,
  isValidFrequency,
  isWithinLength,
} = require('../utils/validators');

describe('validators', () => {
  test('isValidAmount accepts positive finite numbers', () => {
    expect(isValidAmount(10)).toBe(true);
    expect(isValidAmount('25.5')).toBe(true);
    expect(isValidAmount(0)).toBe(false);
    expect(isValidAmount(-5)).toBe(false);
    expect(isValidAmount('abc')).toBe(false);
  });

         test('isValidEmail validates basic email format', () => {
           expect(isValidEmail('user@example.com')).toBe(true);
           expect(isValidEmail('not-an-email')).toBe(false);
           expect(isValidEmail(123)).toBe(false);
         });

         test('isValidTransactionType only allows income or expense', () => {
           expect(isValidTransactionType('income')).toBe(true);
           expect(isValidTransactionType('expense')).toBe(true);
           expect(isValidTransactionType('transfer')).toBe(false);
         });

         test('isNonEmptyString requires non-empty trimmed strings', () => {
           expect(isNonEmptyString('hello')).toBe(true);
           expect(isNonEmptyString('   ')).toBe(false);
           expect(isNonEmptyString(42)).toBe(false);
         });

         test('isValidObjectId checks 24 hex characters', () => {
           expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
           expect(isValidObjectId('not-an-id')).toBe(false);
         });

         test('isValidDate checks parseable dates', () => {
           expect(isValidDate('2026-07-14')).toBe(true);
           expect(isValidDate('')).toBe(false);
           expect(isValidDate('not-a-date')).toBe(false);
         });

         test('isValidFrequency only allows known frequencies', () => {
           expect(isValidFrequency('monthly')).toBe(true);
           expect(isValidFrequency('hourly')).toBe(false);
         });

         test('isWithinLength enforces max length', () => {
           expect(isWithinLength('short', 10)).toBe(true);
           expect(isWithinLength('a'.repeat(300))).toBe(false);
         });
});
