const bcrypt = require('bcryptjs');
const User = require('../models/User');

describe('User model', () => {
  test('requires a name, email, and password', () => {
    const user = new User({});
    const error = user.validateSync();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  test('rejects a password shorter than 6 characters', () => {
    const user = new User({ name: 'Jane Doe', email: 'jane@example.com', password: '123' });
    const error = user.validateSync();
    expect(error.errors.password).toBeDefined();
  });

  test('rejects an invalid email format', () => {
    const user = new User({ name: 'Jane Doe', email: 'not-an-email', password: 'password123' });
    const error = user.validateSync();
    expect(error.errors.email).toBeDefined();
  });

  test('passes validation with valid fields', () => {
    const user = new User({ name: 'Jane Doe', email: 'jane@example.com', password: 'password123' });
    const error = user.validateSync();
    expect(error).toBeUndefined();
  });

  test('lowercases and trims the email', () => {
    const user = new User({ name: 'Jane Doe', email: '  Jane@EXAMPLE.com  ', password: 'password123' });
    expect(user.email).toBe('jane@example.com');
  });

  test('trims whitespace from the name', () => {
    const user = new User({ name: '  Jane Doe  ', email: 'jane@example.com', password: 'password123' });
    expect(user.name).toBe('Jane Doe');
  });

  describe('matchPassword', () => {
    test('resolves true for a correct password and false for an incorrect one', async () => {
      const hashed = await bcrypt.hash('mySecret123', 10);
      const user = new User({ name: 'Jane Doe', email: 'jane@example.com', password: hashed });
      await expect(user.matchPassword('mySecret123')).resolves.toBe(true);
      await expect(user.matchPassword('wrongPassword')).resolves.toBe(false);
    });
  });
});
