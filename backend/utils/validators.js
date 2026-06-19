// Shared input validation helpers for the Personal Finance Tracker API.

// Returns true if the value is a finite number greater than zero.
function isValidAmount(value) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0;
}

// Basic email format check.
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
}

// Ensures a transaction type is one of the allowed values.
function isValidTransactionType(type) {
  return type === 'income' || type === 'expense';
}

// Ensures a string is non-empty after trimming.
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

module.exports = {
  isValidAmount,
  isValidEmail,
  isValidTransactionType,
  isNonEmptyString,
};
