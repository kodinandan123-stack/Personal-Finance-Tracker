import { useState, useMemo } from 'react';

/**
 * Custom hook for paginating an array of items.
 * @param {Array} items - The full array of items to paginate.
 * @param {number} itemsPerPage - Number of items to display per page.
 * @returns {Object} Pagination state and controls.
 */
function usePagination(items = [], itemsPerPage = 10) {
    const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page) => {
        const clamped = Math.min(Math.max(1, page), totalPages);
        setCurrentPage(clamped);
  };

  const nextPage = () => goToPage(currentPage + 1);
    const prevPage = () => goToPage(currentPage - 1);
    const reset = () => setCurrentPage(1);

  return {
        currentPage,
        totalPages,
        paginatedItems,
        goToPage,
        nextPage,
        prevPage,
        reset,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
  };
}

export default usePagination;
