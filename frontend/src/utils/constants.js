// Transaction types
export const TRANSACTION_TYPES = {
    INCOME: 'income',
        EXPENSE: 'expense',
      };

// Expense & income categories
export const CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Food',
  'Housing',
  'Transport',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Other',
];

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift'];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Housing',
  'Transport',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Other',
];

// Recurring frequency options
export const RECURRENCE_FREQUENCIES = [
{ label: 'Daily', value: 'daily' },
{ label: 'Weekly', value: 'weekly' },
{ label: 'Monthly', value: 'monthly' },
{ label: 'Yearly', value: 'yearly' },
];

// Budget period options
export const BUDGET_PERIODS = [
{ label: 'Monthly', value: 'monthly' },
{ label: 'Yearly', value: 'yearly' },
];

// Pagination default
export const DEFAULT_PAGE_SIZE = 10;

// Local storage keys
export const LS_KEYS = {
  AUTH_TOKEN: 'pft_auth_token',
  USER: 'pft_user',
  THEME: 'pft_theme',
};
