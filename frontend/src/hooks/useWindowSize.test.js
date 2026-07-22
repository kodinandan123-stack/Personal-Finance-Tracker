import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useWindowSize from './useWindowSize';

function setWindowSize(width, height) {
  window.innerWidth = width;
  window.innerHeight = height;
}

describe('useWindowSize', () => {
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;

         afterEach(() => {
           setWindowSize(originalWidth, originalHeight);
         });

         it('returns the current window dimensions on mount', () => {
           setWindowSize(1024, 768);
           const { result } = renderHook(() => useWindowSize());

            expect(result.current).toEqual({ width: 1024, height: 768 });
         });

         it('updates the dimensions when the window is resized', () => {
           setWindowSize(1024, 768);
           const { result } = renderHook(() => useWindowSize());

            act(() => {
              setWindowSize(500, 400);
              window.dispatchEvent(new Event('resize'));
            });

            expect(result.current).toEqual({ width: 500, height: 400 });
         });

         it('removes the resize listener on unmount', () => {
           const removeSpy = vi.spyOn(window, 'removeEventListener');
           const { unmount } = renderHook(() => useWindowSize());

            unmount();

            expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));

            removeSpy.mockRestore();
         });

         it('does not update state after unmount when a resize event fires', () => {
           setWindowSize(1024, 768);
           const { result, unmount } = renderHook(() => useWindowSize());

            unmount();
           setWindowSize(320, 240);
           window.dispatchEvent(new Event('resize'));

            expect(result.current).toEqual({ width: 1024, height: 768 });
         });
});
