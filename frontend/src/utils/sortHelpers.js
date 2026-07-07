/**
 * sortHelpers.js
 * Utility functions for sorting transaction and budget lists.
 */

/**
 * Sort an array of transactions by date.
 * @param {Array} transactions
 * @param {'asc'|'desc'} order
 */
export function sortByDate(transactions, order = 'desc') {
    return [...transactions].sort((a, b) => {
          const diff = new Date(a.date) - new Date(b.date);
          return order === 'asc' ? diff : -diff;
    });
}

/**
 * Sort an array of transactions by amount.
 * @param {Array} transactions
 * @param {'asc'|'desc'} order
 */
export function sortByAmount(transactions, order = 'desc') {
    return [...transactions].sort((a, b) => {
          const diff = a.amount - b.amount;
          return order === 'asc' ? diff : -diff;
    });
}

/**
 * Sort an array of transactions alphabetically by category name.
 * @param {Array} transactions
 * @param {'asc'|'desc'} order
 */
export function sortByCategory(transactions, order = 'asc') {
    return [...transactions].sort((a, b) => {
          const diff = a.category.localeCompare(b.category);
          return order === 'asc' ? diff : -diff;
    });
}
