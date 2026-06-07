const Transaction = require('../models/Transaction');

// @desc Get all transactions for the logged-in user
// @route GET /api/transactions
// @access Private
const getTransactions = async (req, res) => {
      try {
              const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
              res.json(transactions);
      } catch (error) {
              res.status(500).json({ message: 'Server error', error: error.message });
      }
};

// @desc Add a new transaction
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

// @desc Update a transaction
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

// @desc Delete a transaction
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

// @desc Get financial summary (totals + category breakdown) for the logged-in user
// @route GET /api/transactions/summary
// @access Private
const getSummary = async (req, res) => {
      try {
              const transactions = await Transaction.find({ user: req.user.id });

        let totalIncome = 0;
              let totalExpenses = 0;
              const categoryBreakdown = {};

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
        });

        res.json({
                  totalIncome,
                  totalExpenses,
                  balance: totalIncome - totalExpenses,
                  categoryBreakdown,
        });
      } catch (error) {
              res.status(500).json({ message: 'Server error', error: error.message });
      }
};

module.exports = { getTransactions, addTransaction, updateTransaction, deleteTransaction, getSummary };
