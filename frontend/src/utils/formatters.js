/**
 * Date and number formatting helpers shared across the app.
 *
 * Keeping these in one place avoids duplicating Intl options and
 * keeps formatting consistent between the dashboard, reports, and
 * transaction lists.
 */

/**
 * Formats a date as a short, human-readable string (e.g. "Jun 22, 2026").
 *
 * @param {Date|string|number} input - A Date, ISO string, or timestamp.
 * @param {string} [locale='en-US'] - BCP 47 locale tag.
 * @returns {string} The formatted date, or an empty string if invalid.
 */
export function formatDate(input, locale = 'en-US') {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a date for use in <input type="date"> as YYYY-MM-DD.
 *
 * @param {Date|string|number} input - A Date, ISO string, or timestamp.
 * @returns {string} The ISO date portion, or an empty string if invalid.
 */
export function toInputDate(input) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

/**
 * Returns the first and last day of the month for a given date.
 *
 * Handy for the reports page when building default date ranges.
 *
 * @param {Date|string|number} [input=new Date()] - Reference date.
 * @returns {{ start: Date, end: Date }} Month boundaries.
 */
export function monthRange(input = new Date()) {
  const date = input instanceof Date ? input : new Date(input);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
}

/**
 * Returns a relative description such as "Today", "Yesterday",
 * or the formatted date for anything older.
 *
 * @param {Date|string|number} input - A Date, ISO string, or timestamp.
 * @param {string} [locale='en-US'] - BCP 47 locale tag.
 * @returns {string} A friendly relative label.
 */
export function relativeDay(input, locale = 'en-US') {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(today) - startOfDay(date)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return formatDate(date, locale);
}
