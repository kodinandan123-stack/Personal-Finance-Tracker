import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import usePagination from './usePagination';

const items = Array.from({ length: 25 }, (_, i) => i + 1);

describe('usePagination', () => {
  it('starts on page 1', () => {
    const { result } = renderHook(() => usePagination(items, 10));
    expect(result.current.currentPage).toBe(1);
  });

  it('calculates the total number of pages', () => {
    const { result } = renderHook(() => usePagination(items, 10));
    expect(result.current.totalPages).toBe(3);
  });

  it('returns the correct slice of items for the current page', () => {
    const { result } = renderHook(() => usePagination(items, 10));
    expect(result.current.paginatedItems).toEqual(items.slice(0, 10));
  });

  it('defaults to at least 1 total page when items is empty', () => {
    const { result } = renderHook(() => usePagination([], 10));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedItems).toEqual([]);
  });

  it('navigates to the next page', () => {
    const { result } = renderHook(() => usePagination(items, 10));

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedItems).toEqual(items.slice(10, 20));
  });

  it('navigates to the previous page', () => {
    const { result } = renderHook(() => usePagination(items, 10));

    act(() => {
      result.current.goToPage(2);
    });
    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('clamps goToPage within valid bounds', () => {
    const { result } = renderHook(() => usePagination(items, 10));

    act(() => {
      result.current.goToPage(99);
    });
    expect(result.current.currentPage).toBe(3);

    act(() => {
      result.current.goToPage(-5);
    });
    expect(result.current.currentPage).toBe(1);
  });

  it('exposes hasNextPage and hasPrevPage flags', () => {
    const { result } = renderHook(() => usePagination(items, 10));
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(true);
  });

  it('resets to the first page', () => {
    const { result } = renderHook(() => usePagination(items, 10));

    act(() => {
      result.current.goToPage(3);
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('recalculates paginated items when the itemsPerPage changes', () => {
    const { result, rerender } = renderHook(
      ({ perPage }) => usePagination(items, perPage),
      { initialProps: { perPage: 10 } }
    );

    expect(result.current.paginatedItems).toEqual(items.slice(0, 10));

    rerender({ perPage: 5 });
    expect(result.current.paginatedItems).toEqual(items.slice(0, 5));
  });
});
