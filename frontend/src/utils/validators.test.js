import { describe, it, expect } from 'vitest';
import {
    validateAmount,
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    validateRequired,
} from './validators';

describe('validateAmount', () => {
    it('requires a value', () => {
          expect(validateAmount('')).toBe('Amount is required.');
          expect(validateAmount(null)).toBe('Amount is required.');
          expect(validateAmount(undefined)).toBe('Amount is required.');
    });

           it('rejects non-numeric values', () => {
                 expect(validateAmount('abc')).toBe('Amount must be a number.');
           });

           it('rejects zero and negative numbers', () => {
                 expect(validateAmount(0)).toBe('Amount must be greater than zero.');
                 expect(validateAmount(-5)).toBe('Amount must be greater than zero.');
           });

           it('accepts a positive number', () => {
                 expect(validateAmount(100)).toBeNull();
           });
});

describe('validateEmail', () => {
    it('requires a value', () => {
          expect(validateEmail('')).toBe('Email is required.');
          expect(validateEmail('   ')).toBe('Email is required.');
    });

           it('rejects malformed addresses', () => {
                 expect(validateEmail('not-an-email')).toBe('Please enter a valid email address.');
                 expect(validateEmail('missing@domain')).toBe('Please enter a valid email address.');
           });

           it('accepts a valid email address', () => {
                 expect(validateEmail('user@example.com')).toBeNull();
           });
});

describe('validatePassword', () => {
    it('requires a value', () => {
          expect(validatePassword('')).toBe('Password is required.');
    });

           it('rejects passwords shorter than 8 characters', () => {
                 expect(validatePassword('short')).toBe('Password must be at least 8 characters.');
           });

           it('accepts a password with at least 8 characters', () => {
                 expect(validatePassword('longenough')).toBeNull();
           });
});

describe('validatePasswordMatch', () => {
    it('requires confirmation value', () => {
          expect(validatePasswordMatch('secret123', '')).toBe('Please confirm your password.');
    });

           it('rejects mismatched passwords', () => {
                 expect(validatePasswordMatch('secret123', 'other456')).toBe('Passwords do not match.');
           });

           it('accepts matching passwords', () => {
                 expect(validatePasswordMatch('secret123', 'secret123')).toBeNull();
           });
});

describe('validateRequired', () => {
    it('rejects empty values with default field name', () => {
          expect(validateRequired('')).toBe('This field is required.');
    });

           it('rejects empty values with a custom field name', () => {
                 expect(validateRequired('   ', 'Category')).toBe('Category is required.');
           });

           it('accepts a non-empty value', () => {
                 expect(validateRequired('Groceries', 'Category')).toBeNull();
           });
});
