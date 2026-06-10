const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get all budgets for the authenticated user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { user: req.user._id };
    if (month) filter.month = month;

    const budgets = await Budget.find(filter).sort({ category: 1 });

    // Attach real spending from transactions for the given month
    const enrichedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const [year, mon] = budget.month.split('-').map(Number);
        const startDate = new Date(year, mon - 1, 1);
        const endDate = new Date(year, mon, 0, 23, 59, 59);

        const spentAgg = await Transaction.aggregate([
          {
            $match: {
              user: req.user._id,
              type: 'expense',
              category: budget.category,
              date: { $gte: startDate, $lte: endDate },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const spent = spentAgg.length > 0 ? spentAgg[0].total : 0;
        await Budget.findByIdAndUpdate(budget._id, { spent });
        return { ...budget.toJSON(), spent };
      })
    );

    res.json(enrichedBudgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    const existingBudget = await Budget.findOne({
      user: req.user._id,
      category,
      month,
    });

    if (existingBudget) {
      return res.status(400).json({
        message: `A budget for ${category} in ${month} already exists.`,
      });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      limit,
      month,
    });

    res.status(201).json(budget);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate budget entry for this category and month.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found.' });
    }

    const { category, limit, month } = req.body;
    if (category) budget.category = category;
    if (limit !== undefined) budget.limit = limit;
    if (month) budget.month = month;

    const updated = await budget.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found.' });
    }

    res.json({ message: 'Budget deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get budget summary for a given month
// @route   GET /api/budgets/summary
// @access  Private
const getBudgetSummary = async (req, res) => {
  try {
    const { month } = req.query;
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const budgets = await Budget.find({ user: req.user._id, month: targetMonth });

    const summary = budgets.map((b) => ({
      category: b.category,
      limit: b.limit,
      spent: b.spent,
      remaining: b.remaining,
      percentUsed: b.percentUsed,
      exceeded: b.isExceeded(),
    }));

    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    res.json({
      month: targetMonth,
      budgets: summary,
      totalLimit,
      totalSpent,
      totalRemaining: Math.max(0, totalLimit - totalSpent),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetSummary };
