const Transaction = require('../models/Transaction');

// @desc  Get all transactions for the logged-in user (with pagination & filtering)
// @route GET /api/transactions?page=1&limit=10&type=expense&category=Food&startDate=2026-01-01&endDate=2026-06-30
// @access Private
const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Build dynamic filter
    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Add a new transaction
// @route POST /api/transactions
// @access Private
const addTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({ message: 'Type, category, and amount are required' });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      category,
      amount,
      description,
      date: date || Date.now(),
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Update a transaction
// @route PUT /api/transactions/:id
// @access Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this transaction' });
    }

    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Delete a transaction
// @route DELETE /api/transactions/:id
// @access Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this transaction' });
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Get financial summary (totals, category breakdown, monthly breakdown)
// @route GET /api/transactions/summary
// @access Private
const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryBreakdown = {};
    const monthlyBreakdown = {};

    transactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpenses += t.amount;
      }

      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { income: 0, expense: 0 };
      }
      categoryBreakdown[t.category][t.type] =
        (categoryBreakdown[t.category][t.type] || 0) + t.amount;

      const monthKey = new Date(t.date).toISOString().slice(0, 7);
      if (!monthlyBreakdown[monthKey]) {
        monthlyBreakdown[monthKey] = { income: 0, expense: 0, net: 0 };
      }
      monthlyBreakdown[monthKey][t.type] =
        (monthlyBreakdown[monthKey][t.type] || 0) + t.amount;
      monthlyBreakdown[monthKey].net =
        monthlyBreakdown[monthKey].income - monthlyBreakdown[monthKey].expense;
    });

    const sortedMonthly = Object.keys(monthlyBreakdown)
      .sort()
      .reduce((acc, key) => {
        acc[key] = monthlyBreakdown[key];
        return acc;
      }, {});

    res.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryBreakdown,
      monthlyBreakdown: sortedMonthly,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc  Export transactions as CSV
// @route GET /api/transactions/export
// @access Private
const exportTransactionsCSV = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;

    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    const csvHeader = 'Date,Type,Category,Amount,Description\n';
    const csvRows = transactions
      .map((t) => {
        const date = new Date(t.date).toISOString().slice(0, 10);
        const desc = (t.description || '').replace(/"/g, '""');
        const cat = t.category.replace(/"/g, '""');
        return date + ',' + t.type + ',"' + cat + '",' + t.amount + ',"' + desc + '"';
      })
      .join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  exportTransactionsCSV,
};
