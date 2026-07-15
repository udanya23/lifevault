/**
 * utils/csv.js — Minimal CSV serialization (no external dependency)
 */

/** Escape a single CSV cell per RFC 4180 */
const escapeCell = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Convert rows to a CSV string.
 * @param {Array<object>} rows
 * @param {Array<{ key: string, label: string }>} columns
 * @returns {string}
 */
const toCsv = (rows, columns) => {
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCell(row[c.key])).join(',')
  );
  return [header, ...lines].join('\r\n');
};

module.exports = { toCsv, escapeCell };
