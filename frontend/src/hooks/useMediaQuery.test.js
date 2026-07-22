import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useMediaQuery from './useMediaQuery';

function createMatchMediaMock(initialMatches) {
  let matches = initialMatches;
  let changeHandler;
  const mql = {
    get matches() {
      return matches;
    },
    addEventListener: vi.fn((event, handler) => {
      if (event === 'change') changeHandler = handler;
    }),
    removeEventListener: vi.fn(),
  };
  return {
    mql,
    trigger(nextMatches) {
      matches = nextMatches;
      changeHandler?.({ matches: nextMatches });
    },
  };
}

describe('useMediaQuery', () => {
  it('returns false when matchMedia is unavailable', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = undefined;

     const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);

     window.matchMedia = originalMatchMedia;
  });

         it('returns the initial match state from matchMedia', () => {
           const { mql } = createMatchMediaMock(true);
           window.matchMedia = vi.fn().mockReturnValue(mql);

            const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
           expect(result.current).toBe(true);
         });

         it('queries with the provided media query string', () => {
           const { mql } = createMatchMediaMock(false);
           const matchMediaSpy = vi.fn().mockReturnValue(mql);
           window.matchMedia = matchMediaSpy;

            renderHook(() => useMediaQuery('(min-width: 1024px)'));
           expect(matchMediaSpy).toHaveBeenCalledWith('(min-width: 1024px)');
         });

         it('updates when the media query match state changes', () => {
           const { mql, trigger } = createMatchMediaMock(false);
           window.matchMedia = vi.fn().mockReturnValue(mql);

            const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
           expect(result.current).toBe(false);

            act(() => {
              trigger(true);
            });

            expect(result.current).toBe(true);
         });

         it('removes the change listener on unmount', () => {
           const { mql } = createMatchMediaMock(false);
           window.matchMedia = vi.fn().mockReturnValue(mql);

            const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));
           unmount();

            expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
         });
});
