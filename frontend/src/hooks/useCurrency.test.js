import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useCurrency from './useCurrency';

beforeEach(() => {
  window.localStorage.clear();
});

describe('useCurrency', () => {
  it('defaults to USD when nothing is stored', () => {
    const { result } = renderHook(() => useCurrency());
    expect(result.current.currency).toBe('USD');
    expect(result.current.currencySymbol).toBe('$');
  });

  it('uses the provided default currency', () => {
    const { result } = renderHook(() => useCurrency('EUR'));
    expect(result.current.currency).toBe('EUR');
  });

  it('reads a previously stored currency preference', () => {
    window.localStorage.setItem('preferredCurrency', 'GBP');
    const { result } = renderHook(() => useCurrency());
    expect(result.current.currency).toBe('GBP');
  });

  it('falls back to the default when the stored currency is unknown', () => {
    window.localStorage.setItem('preferredCurrency', 'XYZ');
    const { result } = renderHook(() => useCurrency());
    expect(result.current.currency).toBe('USD');
  });

  it('updates the currency and persists it to localStorage', () => {
    const { result } = renderHook(() => useCurrency());

    act(() => {
      result.current.setCurrency('JPY');
    });

    expect(result.current.currency).toBe('JPY');
    expect(window.localStorage.getItem('preferredCurrency')).toBe('JPY');
  });

  it('ignores unknown currency codes when setting', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useCurrency());

    act(() => {
      result.current.setCurrency('FAKE');
    });

    expect(result.current.currency).toBe('USD');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('formats an amount as a currency string', () => {
    const { result } = renderHook(() => useCurrency('USD'));
    expect(result.current.format(1234.5)).toBe('$1,234.50');
  });

  it('formats large amounts in compact notation', () => {
    const { result } = renderHook(() => useCurrency('USD'));
    expect(result.current.formatCompact(1234567)).toMatch(/^\$1\.2\d?M$/);
  });

  it('exposes the list of available currencies', () => {
    const { result } = renderHook(() => useCurrency());
    expect(result.current.availableCurrencies).toEqual(
      expect.arrayContaining(['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CHF'])
    );
  });
});
