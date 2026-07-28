import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();
let requestInterceptor;

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      patch: mockPatch,
      delete: mockDelete,
      interceptors: {
        request: {
          use: (fn) => {
            requestInterceptor = fn;
          },
        },
      },
    })),
  },
}));

const api = await import('./api');

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe('api service', () => {
  it('adds an Authorization header when a token is stored', () => {
    window.localStorage.setItem('token', 'abc123');
    const config = requestInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer abc123');
  });

  it('does not add an Authorization header when there is no token', () => {
    const config = requestInterceptor({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('calls the register endpoint with the given data', () => {
    api.registerUser({ email: 'a@b.com' });
    expect(mockPost).toHaveBeenCalledWith('/auth/register', { email: 'a@b.com' });
  });

  it('calls the login endpoint with the given data', () => {
    api.loginUser({ email: 'a@b.com' });
    expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com' });
  });

  it('fetches transactions with query params', () => {
    api.getTransactions({ month: 5 });
    expect(mockGet).toHaveBeenCalledWith('/transactions', { params: { month: 5 } });
  });

  it('deletes a transaction by id', () => {
    api.deleteTransaction('t1');
    expect(mockDelete).toHaveBeenCalledWith('/transactions/t1');
  });

  it('updates a budget by id with the given data', () => {
    api.updateBudget('b1', { limit: 200 });
    expect(mockPut).toHaveBeenCalledWith('/budgets/b1', { limit: 200 });
  });

  it('marks a notification as read by id', () => {
    api.markNotificationRead('n1');
    expect(mockPatch).toHaveBeenCalledWith('/notifications/n1/read');
  });

  it('fetches the dashboard summary', () => {
    api.getDashboard();
    expect(mockGet).toHaveBeenCalledWith('/dashboard');
  });
});
