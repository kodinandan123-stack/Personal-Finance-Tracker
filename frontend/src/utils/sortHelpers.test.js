import { describe, it, expect } from 'vitest';
import { sortByDate, sortByAmount, sortByCategory } from './sortHelpers';

const transactions = [
  { date: '2026-01-10', amount: 50, category: 'Food' },
  { date: '2026-03-05', amount: 200, category: 'Rent' },
  { date: '2026-02-20', amount: 20, category: 'Entertainment' },
  ];

describe('sortByDate', () => {
    it('sorts transactions from newest to oldest by default', () => {
          const result = sortByDate(transactions);
          expect(result.map((t) => t.date)).toEqual(['2026-03-05', '2026-02-20', '2026-01-10']);
    });

           it('sorts transactions from oldest to newest when order is "asc"', () => {
                 const result = sortByDate(transactions, 'asc');
                 expect(result.map((t) => t.date)).toEqual(['2026-01-10', '2026-02-20', '2026-03-05']);
           });

           it('does not mutate the original array', () => {
                 const original = [...transactions];
                 sortByDate(transactions);
                 expect(transactions).toEqual(original);
           });
});

describe('sortByAmount', () => {
    it('sorts transactions from highest to lowest amount by default', () => {
          const result = sortByAmount(transactions);
          expect(result.map((t) => t.amount)).toEqual([200, 50, 20]);
    });

           it('sorts transactions from lowest to highest when order is "asc"', () => {
                 const result = sortByAmount(transactions, 'asc');
                 expect(result.map((t) => t.amount)).toEqual([20, 50, 200]);
           });
});

describe('sortByCategory', () => {
    it('sorts transactions alphabetically by category by default', () => {
          const result = sortByCategory(transactions);
          expect(result.map((t) => t.category)).toEqual(['Entertainment', 'Food', 'Rent']);
    });

           it('sorts transactions in reverse alphabetical order when order is "desc"', () => {
                 const result = sortByCategory(transactions, 'desc');
                 expect(result.map((t) => t.category)).toEqual(['Rent', 'Food', 'Entertainment']);
           });

           it('does not mutate the original array', () => {
                 const original = [...transactions];
                 sortByCategory(transactions);
                 expect(transactions).toEqual(original);
           });
});
