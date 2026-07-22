import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useClickOutside from './useClickOutside';

describe('useClickOutside', () => {
  it('returns a ref object', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useClickOutside(handler));
    expect(result.current).toHaveProperty('current');
  });

         it('calls the handler when a mousedown occurs outside the referenced element', () => {
           const handler = vi.fn();
           const { result } = renderHook(() => useClickOutside(handler));

            const outside = document.createElement('div');
           document.body.appendChild(outside);
           const inside = document.createElement('div');
           document.body.appendChild(inside);
           result.current.current = inside;

            outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

            expect(handler).toHaveBeenCalledTimes(1);

            document.body.removeChild(outside);
           document.body.removeChild(inside);
         });

         it('does not call the handler when the click occurs inside the referenced element', () => {
           const handler = vi.fn();
           const { result } = renderHook(() => useClickOutside(handler));

            const inside = document.createElement('div');
           document.body.appendChild(inside);
           result.current.current = inside;

            inside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

            expect(handler).not.toHaveBeenCalled();

            document.body.removeChild(inside);
         });

         it('calls the handler on touchstart events outside the referenced element', () => {
           const handler = vi.fn();
           const { result } = renderHook(() => useClickOutside(handler));

            const outside = document.createElement('div');
           document.body.appendChild(outside);
           result.current.current = document.createElement('div');

            outside.dispatchEvent(new Event('touchstart', { bubbles: true }));

            expect(handler).toHaveBeenCalledTimes(1);

            document.body.removeChild(outside);
         });

         it('removes event listeners on unmount', () => {
           const handler = vi.fn();
           const removeSpy = vi.spyOn(document, 'removeEventListener');
           const { unmount } = renderHook(() => useClickOutside(handler));

            unmount();

            expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
           expect(removeSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));

            removeSpy.mockRestore();
         });
});
