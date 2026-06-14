const Transaction = require('../models/Transaction');

// @desc    Get spending by category for a given month/year
// @route   GET /api/reports/spending-by-category
// @access  Private
const getSpendingByCategory = async (req, res) => {
    try {
          const userId = req.user.id;
          const { month, year } = req.query;
          const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
          const targetYear = year ? parseInt(year) : new Date().getFullYear();

          const startDate = new Date(targetYear, targetMonth, 1);
          const endDate = new Date(targetYear, targetMonth + 1, 0);

          const transactions = await Transaction.find({
                  user: userId,
                  type: 'expense',
                  date: { $gte: startDate, $lte: endDate },
                });

          const categoryTotals = {};
          transactions.forEach((t) => {
                  categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
                });

          const result = Object.entries(categoryTotals).map(([category, total]) => ({
                  category,
                  total,
                }));

          res.json({ success: true, data: result });
        } catch (error) {
          console.error('Report error:', error);
          res.status(500).json({ success: false, message: 'Server error' });
        }
  };

// @desc    Get monthly income vs expense trend (last 6 months)
// @route   GET /api/reports/monthly-trend
// @access  Private
const getMonthlyTrend = async (req, res) => {
    try {
          const userId = req.user.id;
          const months = [];
          const now = new Date();

          for (let i = 5; i >= 0; i--) {
                  const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
                  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                  const transactions = await Transaction.find({
                            user: userId,
                            date: { $gte: startDate, $lte: endDate },
                          });

                  const income = transactions
                    .filter((t) => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);

                  const expenses = transactions
                    .filter((t) => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                  months.push({
                            month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
                            income,
                            expenses,
                            net: income - expenses,
                          });
                }

          res.json({ success: true, data: months });
        } catch (error) {
          console.error('Monthly trend error:', error);
          res.status(500).json({ success: false, message: 'Server error' });
        }
  };

module.exports = { getSpendingByCategory, getMonthlyTrend };
