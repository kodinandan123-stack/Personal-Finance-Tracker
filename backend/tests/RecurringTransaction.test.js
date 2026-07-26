const mongoose = require('mongoose');
const RecurringTransaction = require('../models/RecurringTransaction');

describe('RecurringTransaction model', () => {
  test('defaults frequency to monthly, isActive to true, and description to empty string', () => {
    const rt = new RecurringTransaction({
      user: new mongoose.Types.ObjectId(),
      type: 'expense',
      category: 'Rent',
      amount: 1200,
      startDate: new Date('2026-01-01'),
    });
    expect(rt.frequency).toBe('monthly');
    expect(rt.isActive).toBe(true);
    expect(rt.description).toBe('');
    expect(rt.endDate).toBeNull();
    expect(rt.lastProcessedDate).toBeNull();
  });

  test('sets nextDueDate to startDate when not provided', () => {
    const startDate = new Date('2026-02-01');
    const rt = new RecurringTransaction({
      user: new mongoose.Types.ObjectId(),
      type: 'income',
      category: 'Salary',
      amount: 3000,
      startDate,
    });
    rt.validateSync();
    expect(rt.nextDueDate).toEqual(startDate);
  });

  test('requires a user, type, category, and amount', () => {
    const rt = new RecurringTransaction({});
    const error = rt.validateSync();
    expect(error.errors.user).toBeDefined();
    expect(error.errors.type).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.amount).toBeDefined();
  });

  test('rejects a negative amount', () => {
    const rt = new RecurringTransaction({
      user: new mongoose.Types.ObjectId(),
      type: 'expense',
      category: 'Utilities',
      amount: -50,
      startDate: new Date(),
    });
    const error = rt.validateSync();
    expect(error.errors.amount).toBeDefined();
  });

  test('rejects a type outside income/expense', () => {
    const rt = new RecurringTransaction({
      user: new mongoose.Types.ObjectId(),
      type: 'transfer',
      category: 'Utilities',
      amount: 50,
      startDate: new Date(),
    });
    const error = rt.validateSync();
    expect(error.errors.type).toBeDefined();
  });

  test('rejects an invalid frequency', () => {
    const rt = new RecurringTransaction({
      user: new mongoose.Types.ObjectId(),
      type: 'expense',
      category: 'Utilities',
      amount: 50,
      startDate: new Date(),
      frequency: 'hourly',
    });
    const error = rt.validateSync();
    expect(error.errors.frequency).toBeDefined();
  });

  describe('advanceDate', () => {
    const base = new Date(2026, 0, 15);

    test('advances by one day for daily frequency', () => {
      const result = RecurringTransaction.advanceDate(base, 'daily');
      expect(result.getDate()).toBe(16);
    });

    test('advances by seven days for weekly frequency', () => {
      const result = RecurringTransaction.advanceDate(base, 'weekly');
      expect(result.getDate()).toBe(22);
    });

    test('advances by fourteen days for biweekly frequency', () => {
      const result = RecurringTransaction.advanceDate(base, 'biweekly');
      expect(result.getDate()).toBe(29);
    });

    test('advances by one month for monthly frequency', () => {
      const result = RecurringTransaction.advanceDate(base, 'monthly');
      expect(result.getMonth()).toBe(1);
    });

    test('advances by three months for quarterly frequency', () => {
      const result = RecurringTransaction.advanceDate(base, 'quarterly');
      expect(result.getMonth()).toBe(3);
    });

    test('advances by one year for yearly frequency', () => {
      const result = RecurringTransaction.advanceDate(base, 'yearly');
      expect(result.getFullYear()).toBe(2027);
    });

    test('defaults to advancing one month for an unknown frequency', () => {
      const result = RecurringTransaction.advanceDate(base, 'unknown');
      expect(result.getMonth()).toBe(1);
    });
  });
});
