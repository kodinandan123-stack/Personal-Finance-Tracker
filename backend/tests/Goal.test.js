const mongoose = require('mongoose');
const Goal = require('../models/Goal');

describe('Goal model', () => {
  test('defaults savedAmount to 0, isCompleted to false, and deadline to null', () => {
    const goal = new Goal({ user: new mongoose.Types.ObjectId(), name: 'Emergency Fund', targetAmount: 5000 });
    expect(goal.savedAmount).toBe(0);
    expect(goal.isCompleted).toBe(false);
    expect(goal.deadline).toBeNull();
  });

  test('requires a user, name, and targetAmount', () => {
    const goal = new Goal({});
    const error = goal.validateSync();
    expect(error.errors.user).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.targetAmount).toBeDefined();
  });

  test('rejects a negative targetAmount', () => {
    const goal = new Goal({ user: new mongoose.Types.ObjectId(), name: 'Vacation', targetAmount: -100 });
    const error = goal.validateSync();
    expect(error.errors.targetAmount).toBeDefined();
  });

  test('rejects a negative savedAmount', () => {
    const goal = new Goal({ user: new mongoose.Types.ObjectId(), name: 'Vacation', targetAmount: 1000, savedAmount: -50 });
    const error = goal.validateSync();
    expect(error.errors.savedAmount).toBeDefined();
  });

  test('passes validation with valid fields', () => {
    const goal = new Goal({
      user: new mongoose.Types.ObjectId(),
      name: 'New Laptop',
      targetAmount: 2000,
      savedAmount: 500,
      deadline: new Date('2026-12-31'),
    });
    const error = goal.validateSync();
    expect(error).toBeUndefined();
  });

  test('trims whitespace from the name', () => {
    const goal = new Goal({ user: new mongoose.Types.ObjectId(), name: '  New Car  ', targetAmount: 15000 });
    expect(goal.name).toBe('New Car');
  });
});
