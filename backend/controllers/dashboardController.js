const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// @desc    Get dashboard summary (totals, recent transactions, budget status)
// @route   GET /api/dashboard
// @access  Private
const getDashboardSummary = async (req, res) => {
    try {
          const userId = req.user.id;
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          // Monthly income and expenses
          const monthlyTransactions = await Transaction.find({
                  user: userId,
                  date: { $gte: startOfMonth, $lte: endOfMonth },
          });

          const totalIncome = monthlyTransactions
                  .filter((t) => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0);

          const totalExpenses = monthlyTransactions
                  .filter((t) => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0);

          const netSavings = totalIncome - totalExpenses;

          // Recent transactions (last 5)
          const recentTransactions = await Transaction.find({ user: userId })
                  .sort({ date: -1 })
                  .limit(5);

          // Budget overview
          const budgets = await Budget.find({ user: userId });
          const budgetStatus = budgets.map((budget) => {
                  const spent = monthlyTransactions
                            .filter((t) => t.type === 'expense' && t.category === budget.category)
                            .reduce((sum, t) => sum + t.amount, 0);
                  return {
                            category: budget.category,
                            limit: budget.limit,
                            spent,
                            remaining: budget.limit - spent,
                            percentUsed: budget.limit > 0 ? ((spent / budget.limit) * 100).toFixed(1) : 0,
                  };
          });

          // Goals progress
          const goals = await Goal.find({ user: userId });
          const goalsProgress = goals.map((goal) => ({
                  name: goal.name,
                  targetAmount: goal.targetAmount,
                  currentAmount: goal.currentAmount,
                  percentComplete:
                    goal.targetAmount > 0
                                ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)
                                : 0,
                  deadline: goal.deadline,
          }));

          res.json({
                  success: true,
                  data: {
                            monthlyIncome: totalIncome,
                            monthlyExpenses: totalExpenses,
                            netSavings,
                            recentTransactions,
                            budgetStatus,
                            goalsProgress,
                  },
          });
    } catch (error) {
          console.error('Dashboard error:', error);
          res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getDashboardSummary };
