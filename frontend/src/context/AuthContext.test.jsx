import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

beforeEach(() => {
  window.localStorage.clear();
});

describe('AuthContext', () => {
  it('starts with no user and no token when localStorage is empty', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('reads an existing token from localStorage on mount', () => {
    window.localStorage.setItem('token', 'existing-token');
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.token).toBe('existing-token');
  });

  it('sets the user and token on login, and persists the token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.login({ name: 'Jane Doe' }, 'abc123');
    });

    expect(result.current.user).toEqual({ name: 'Jane Doe' });
    expect(result.current.token).toBe('abc123');
    expect(window.localStorage.getItem('token')).toBe('abc123');
  });

  it('clears the user and token on logout, and removes the token from storage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.login({ name: 'Jane Doe' }, 'abc123');
    });
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(window.localStorage.getItem('token')).toBeNull();
  });

  it('returns null when useAuth is used outside of a provider', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toBeNull();
  });
});
