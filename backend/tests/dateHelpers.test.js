const {
  getMonthRange,
  getCurrentMonthRange,
  toISODate,
  isInRange,
  addDays,
  daysBetween,
} = require('../utils/dateHelpers');

describe('dateHelpers', () => {
  test('getMonthRange returns start and end of given month', () => {
    const { start, end } = getMonthRange(2026, 6);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(6);
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(6);
    expect(end.getDate()).toBe(31);
  });

         test('getCurrentMonthRange matches getMonthRange for today', () => {
           const now = new Date();
           const expected = getMonthRange(now.getFullYear(), now.getMonth());
           const actual = getCurrentMonthRange();
           expect(actual.start.getTime()).toBe(expected.start.getTime());
           expect(actual.end.getTime()).toBe(expected.end.getTime());
         });

         test('toISODate formats a date as YYYY-MM-DD', () => {
           const date = new Date(Date.UTC(2026, 6, 14));
           expect(toISODate(date)).toBe('2026-07-14');
         });

         test('isInRange checks inclusive bounds', () => {
           const start = new Date(2026, 6, 1);
           const end = new Date(2026, 6, 31);
           const inside = new Date(2026, 6, 15);
           const outside = new Date(2026, 7, 1);
           expect(isInRange(inside, start, end)).toBe(true);
           expect(isInRange(start, start, end)).toBe(true);
           expect(isInRange(outside, start, end)).toBe(false);
         });

         test('addDays adds the given number of days', () => {
           const date = new Date(2026, 6, 14);
           const result = addDays(date, 5);
           expect(result.getDate()).toBe(19);
         });

         test('daysBetween returns absolute number of days', () => {
           const a = new Date(2026, 6, 1);
           const b = new Date(2026, 6, 11);
           expect(daysBetween(a, b)).toBe(10);
           expect(daysBetween(b, a)).toBe(10);
         });
});
