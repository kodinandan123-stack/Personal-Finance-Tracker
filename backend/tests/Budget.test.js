const mongoose = require('mongoose');
const Budget = require('../models/Budget');

describe('Budget model', () => {
  describe('virtuals', () => {
    test('remaining returns the difference between limit and spent', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId(), category: 'Food', limit: 300, spent: 120, month: '2026-07' });
      expect(budget.remaining).toBe(180);
    });

    test('remaining never goes below zero when spent exceeds the limit', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId(), category: 'Food', limit: 100, spent: 250, month: '2026-07' });
      expect(budget.remaining).toBe(0);
    });

    test('percentUsed calculates the rounded percentage of the limit spent', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId(), category: 'Transport', limit: 200, spent: 50, month: '2026-07' });
      expect(budget.percentUsed).toBe(25);
    });

    test('percentUsed caps at 100 when spending exceeds the limit', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId(), category: 'Transport', limit: 200, spent: 500, month: '2026-07' });
      expect(budget.percentUsed).toBe(100);
    });

    test('percentUsed returns 0 when the limit is 0', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId(), category: 'Other', limit: 0, spent: 0, month: '2026-07' });
      expect(budget.percentUsed).toBe(0);
    });
  });

  describe('isExceeded', () => {
    test('returns true when spent is greater than the limit', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId(), category: 'Food', limit: 100, spent: 150, month: '2026-07' });
      expect(budget.isExceeded()).toBe(true);
    });

    test('returns false when spent is within the limit', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId(), category: 'Food', limit: 100, spent: 50, month: '2026-07' });
      expect(budget.isExceeded()).toBe(false);
    });
  });

  describe('validation', () => {
    test('requires category, limit, and month', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId() });
      const error = budget.validateSync();
      expect(error.errors.category).toBeDefined();
      expect(error.errors.limit).toBeDefined();
      expect(error.errors.month).toBeDefined();
    });

    test('rejects a month that is not in YYYY-MM format', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId(), category: 'Food', limit: 100, month: '2026/07' });
      const error = budget.validateSync();
      expect(error.errors.month).toBeDefined();
    });

    test('rejects a category outside the allowed enum values', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId(), category: 'Vacation', limit: 100, month: '2026-07' });
      const error = budget.validateSync();
      expect(error.errors.category).toBeDefined();
    });

    test('rejects a negative limit', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId(), category: 'Food', limit: -50, month: '2026-07' });
      const error = budget.validateSync();
      expect(error.errors.limit).toBeDefined();
    });

    test('passes validation with valid fields', () => {
      const budget = new Budget({ user: new mongoose.Types.ObjectId(), category: 'Food', limit: 300, spent: 100, month: '2026-07' });
      const error = budget.validateSync();
      expect(error).toBeUndefined();
    });
  });
});
