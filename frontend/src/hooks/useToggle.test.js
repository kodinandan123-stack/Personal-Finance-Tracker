import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useToggle from './useToggle';

describe('useToggle', () => {
    it('defaults to false when no initial value is given', () => {
          const { result } = renderHook(() => useToggle());
          expect(result.current.value).toBe(false);
    });

           it('respects the provided initial value', () => {
                 const { result } = renderHook(() => useToggle(true));
                 expect(result.current.value).toBe(true);
           });

           it('flips the value with toggle', () => {
                 const { result } = renderHook(() => useToggle(false));
                 act(() => result.current.toggle());
                 expect(result.current.value).toBe(true);
                 act(() => result.current.toggle());
                 expect(result.current.value).toBe(false);
           });

           it('sets the value to true with setOn', () => {
                 const { result } = renderHook(() => useToggle(false));
                 act(() => result.current.setOn());
                 expect(result.current.value).toBe(true);
           });

           it('sets the value to false with setOff', () => {
                 const { result } = renderHook(() => useToggle(true));
                 act(() => result.current.setOff());
                 expect(result.current.value).toBe(false);
           });

           it('allows setting an explicit value with setValue', () => {
                 const { result } = renderHook(() => useToggle(false));
                 act(() => result.current.setValue(true));
                 expect(result.current.value).toBe(true);
           });
});
