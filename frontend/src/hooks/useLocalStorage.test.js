import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useLocalStorage from './useLocalStorage';

beforeEach(() => {
  window.localStorage.clear();
});

describe('useLocalStorage', () => {
  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('theme', 'light'));
    expect(result.current[0]).toBe('light');
  });

         it('reads an existing value from localStorage', () => {
           window.localStorage.setItem('theme', JSON.stringify('dark'));
           const { result } = renderHook(() => useLocalStorage('theme', 'light'));
           expect(result.current[0]).toBe('dark');
         });

         it('updates the stored value and persists it to localStorage', () => {
           const { result } = renderHook(() => useLocalStorage('theme', 'light'));

            act(() => {
              result.current[1]('dark');
            });

            expect(result.current[0]).toBe('dark');
           expect(JSON.parse(window.localStorage.getItem('theme'))).toBe('dark');
         });

         it('supports functional updates like useState', () => {
           const { result } = renderHook(() => useLocalStorage('count', 1));

            act(() => {
              result.current[1]((prev) => prev + 1);
            });

            expect(result.current[0]).toBe(2);
           expect(JSON.parse(window.localStorage.getItem('count'))).toBe(2);
         });

         it('falls back to the initial value when localStorage throws', () => {
           const getItemSpy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
             throw new Error('blocked');
           });

            const { result } = renderHook(() => useLocalStorage('theme', 'light'));
           expect(result.current[0]).toBe('light');

            getItemSpy.mockRestore();
         });

         it('updates the value when a storage event for the same key fires', () => {
           const { result } = renderHook(() => useLocalStorage('theme', 'light'));

            window.localStorage.setItem('theme', JSON.stringify('dark'));
           act(() => {
             window.dispatchEvent(new StorageEvent('storage', { key: 'theme' }));
           });

            expect(result.current[0]).toBe('dark');
         });
});
