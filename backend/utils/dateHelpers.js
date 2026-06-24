/**
 * dateHelpers.js
  * Utility functions for date manipulation used across the backend.
   */

/**
 * Returns the start and end of a given month as Date objects.
  * @param {number} year - Full year (e.g. 2026)
   * @param {number} month - Month index 0-11
    * @returns {{ start: Date, end: Date }}
     */
function getMonthRange(year, month) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { start, end };
}

/**
 * Returns the start and end of the current calendar month.
  * @returns {{ start: Date, end: Date }}
   */
function getCurrentMonthRange() {
    const now = new Date();
    return getMonthRange(now.getFullYear(), now.getMonth());
}

/**
 * Formats a Date to an ISO date string (YYYY-MM-DD).
  * @param {Date} date
   * @returns {string}
    */
function toISODate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Returns true if the given date falls within [start, end] inclusive.
  * @param {Date} date
   * @param {Date} start
    * @param {Date} end
     * @returns {boolean}
      */
function isInRange(date, start, end) {
    return date >= start && date <= end;
}

/**
 * Adds a given number of days to a date and returns a new Date.
  * @param {Date} date
   * @param {number} days
    * @returns {Date}
     */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Returns the number of days between two dates (absolute value).
  * @param {Date} a
   * @param {Date} b
    * @returns {number}
     */
function daysBetween(a, b) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    return Math.abs(Math.floor((b - a) / MS_PER_DAY));
}

module.exports = {
    getMonthRange,
    getCurrentMonthRange,
    toISODate,
    isInRange,
    addDays,
    daysBetween,
};
