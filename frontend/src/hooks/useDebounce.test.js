import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useDebounce from './useDebounce';

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe('useDebounce', () => {
    it('returns the initial value immediately', () => {
          const { result } = renderHook(() => useDebounce('initial', 300));
          expect(result.current).toBe('initial');
    });

           it('does not update the value before the delay has elapsed', () => {
                 const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
                         initialProps: { value: 'first' },
                 });

                  rerender({ value: 'second' });
                 vi.advanceTimersByTime(200);

                  expect(result.current).toBe('first');
           });

           it('updates the value after the delay has elapsed', () => {
                 const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
                         initialProps: { value: 'first' },
                 });

                  rerender({ value: 'second' });
                 vi.advanceTimersByTime(300);

                  expect(result.current).toBe('second');
           });

           it('uses the default delay of 300ms when none is provided', () => {
                 const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
                         initialProps: { value: 'a' },
                 });

                  rerender({ value: 'b' });
                 vi.advanceTimersByTime(299);
                 expect(result.current).toBe('a');

                  vi.advanceTimersByTime(1);
                 expect(result.current).toBe('b');
           });
});
