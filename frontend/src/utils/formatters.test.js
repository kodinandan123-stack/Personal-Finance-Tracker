import { describe, it, expect } from 'vitest';
import { formatDate, toInputDate, monthRange, relativeDay } from './formatters';

describe('formatDate', () => {
    it('formats a valid date as a short human-readable string', () => {
          expect(formatDate('2026-06-22')).toBe('Jun 22, 2026');
    });

           it('returns an empty string for an invalid date', () => {
                 expect(formatDate('not-a-date')).toBe('');
           });

           it('accepts a Date instance directly', () => {
                 expect(formatDate(new Date(2026, 0, 5))).toBe('Jan 5, 2026');
           });
});

describe('toInputDate', () => {
    it('formats a date as YYYY-MM-DD', () => {
          expect(toInputDate('2026-03-15T10:00:00Z')).toBe('2026-03-15');
    });

           it('returns an empty string for an invalid date', () => {
                 expect(toInputDate('invalid')).toBe('');
           });
});

describe('monthRange', () => {
    it('returns the first and last day of the month for a given date', () => {
          const { start, end } = monthRange(new Date(2026, 1, 10));
          expect(start.getDate()).toBe(1);
          expect(start.getMonth()).toBe(1);
          expect(end.getDate()).toBe(28);
          expect(end.getMonth()).toBe(1);
    });

           it('defaults to the current date when no argument is given', () => {
                 const { start, end } = monthRange();
                 expect(start.getDate()).toBe(1);
                 expect(end.getMonth()).toBe(start.getMonth());
           });
});

describe('relativeDay', () => {
    it('returns "Today" for the current date', () => {
          expect(relativeDay(new Date())).toBe('Today');
    });

           it('returns "Yesterday" for the previous day', () => {
                 const yesterday = new Date();
                 yesterday.setDate(yesterday.getDate() - 1);
                 expect(relativeDay(yesterday)).toBe('Yesterday');
           });

           it('returns a formatted date for older dates', () => {
                 expect(relativeDay('2020-01-01')).toBe(formatDate('2020-01-01'));
           });

           it('returns an empty string for an invalid date', () => {
                 expect(relativeDay('invalid')).toBe('');
           });
});
