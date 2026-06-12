const Transaction = require('../models/Transaction');

/**
 * Helper: escape a CSV field value.
 * Wraps the value in double-quotes and escapes any internal double-quotes.
 */
function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If the value contains a comma, newline, or double-quote, wrap in quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Helper: convert an array of transaction objects to a CSV string.
 */
function transactionsToCSV(transactions) {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
  const rows = transactions.map((t) => [
    new Date(t.date).toISOString().split('T')[0],
    t.type,
    t.category,
    t.amount.toFixed(2),
    t.description || '',
  ]);

  const lines = [headers.map(escapeCSV).join(',')];
  rows.forEach((row) => lines.push(row.map(escapeCSV).join(',')));
  return lines.join('\n');
}

/**
 * GET /api/transactions/export
 * Query params:
 *   - startDate (YYYY-MM-DD) – optional lower bound
 *   - endDate   (YYYY-MM-DD) – optional upper bound
 *   - type      ('income' | 'expense') – optional filter
 *
 * Streams a CSV file of the authenticated user's transactions.
 */
const exportTransactionsCSV = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const filter = { user: req.user.id };

    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        // Include the full endDate day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .lean();

    const csv = transactionsToCSV(transactions);
    const filename = 'transactions_' + new Date().toISOString().split('T')[0] + '.csv';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Failed to export transactions', error: error.message });
  }
};

module.exports = { exportTransactionsCSV };
