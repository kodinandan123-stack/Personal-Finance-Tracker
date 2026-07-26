const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

describe('Transaction model', () => {
  test('defaults description to an empty string and date to now', () => {
    const transaction = new Transaction({
      user: new mongoose.Types.ObjectId(),
      type: 'expense',
      category: 'Groceries',
      amount: 45.5,
    });
    expect(transaction.description).toBe('');
    expect(transaction.date).toBeInstanceOf(Date);
  });

  test('requires a user, type, category, and amount', () => {
    const transaction = new Transaction({});
    const error = transaction.validateSync();
    expect(error.errors.user).toBeDefined();
    expect(error.errors.type).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.amount).toBeDefined();
  });

  test('rejects a negative amount', () => {
    const transaction = new Transaction({
      user: new mongoose.Types.ObjectId(),
      type: 'income',
      category: 'Salary',
      amount: -100,
    });
    const error = transaction.validateSync();
    expect(error.errors.amount).toBeDefined();
  });

  test('rejects a type outside income/expense', () => {
    const transaction = new Transaction({
      user: new mongoose.Types.ObjectId(),
      type: 'transfer',
      category: 'Bank',
      amount: 100,
    });
    const error = transaction.validateSync();
    expect(error.errors.type).toBeDefined();
  });

  test('trims whitespace from the category', () => {
    const transaction = new Transaction({
      user: new mongoose.Types.ObjectId(),
      type: 'expense',
      category: '  Dining  ',
      amount: 20,
    });
    expect(transaction.category).toBe('Dining');
  });

  test('passes validation with valid fields', () => {
    const transaction = new Transaction({
      user: new mongoose.Types.ObjectId(),
      type: 'income',
      category: 'Freelance',
      amount: 500,
      description: 'Web design project',
      date: new Date('2026-03-01'),
    });
    const error = transaction.validateSync();
    expect(error).toBeUndefined();
  });
});
