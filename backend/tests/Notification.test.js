const mongoose = require('mongoose');
const Notification = require('../models/Notification');

describe('Notification model', () => {
  test('defaults read to false and relatedId to null', () => {
    const notification = new Notification({
      user: new mongoose.Types.ObjectId(),
      type: 'budget_alert',
      title: 'Budget Alert',
      message: 'You have exceeded your budget for Groceries.',
    });
    expect(notification.read).toBe(false);
    expect(notification.relatedId).toBeNull();
  });

  test('requires a user, type, title, and message', () => {
    const notification = new Notification({});
    const error = notification.validateSync();
    expect(error.errors.user).toBeDefined();
    expect(error.errors.type).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.message).toBeDefined();
  });

  test('rejects a type outside the allowed enum values', () => {
    const notification = new Notification({
      user: new mongoose.Types.ObjectId(),
      type: 'invalid_type',
      title: 'Test',
      message: 'Test message',
    });
    const error = notification.validateSync();
    expect(error.errors.type).toBeDefined();
  });

  test.each(['budget_alert', 'goal_milestone', 'recurring_reminder', 'general'])(
    'accepts %s as a valid type',
    (type) => {
      const notification = new Notification({
        user: new mongoose.Types.ObjectId(),
        type,
        title: 'Test',
        message: 'Test message',
      });
      const error = notification.validateSync();
      expect(error).toBeUndefined();
    }
  );

  test('trims whitespace from the title', () => {
    const notification = new Notification({
      user: new mongoose.Types.ObjectId(),
      type: 'general',
      title: '  Reminder  ',
      message: 'Test message',
    });
    expect(notification.title).toBe('Reminder');
  });

  test('exposes a markAllRead static method', () => {
    expect(typeof Notification.markAllRead).toBe('function');
  });
});
