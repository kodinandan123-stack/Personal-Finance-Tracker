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

// Validates a MongoDB ObjectId string (24 hex characters).
function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);
}

// Validates an ISO 8601 date string or any Date-parseable value.
function isValidDate(value) {
  if (!value) return false;
  return !Number.isNaN(Date.parse(value));
}

// Validates a recurrence or budget frequency value.
function isValidFrequency(value) {
  return ['daily', 'weekly', 'monthly', 'yearly'].includes(value);
}

// Validates that a string does not exceed a maximum length.
function isWithinLength(value, maxLen = 255) {
  return typeof value === 'string' && value.length <= maxLen;
}

module.exports = {
  isValidAmount,
  isValidEmail,
  isValidTransactionType,
  isNonEmptyString,
  isValidObjectId,
  isValidDate,
  isValidFrequency,
  isWithinLength,
};
