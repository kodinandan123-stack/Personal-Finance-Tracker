const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// @desc    Get spending analytics by time period
// @route   GET /api/analytics/spending
// @access  Private
exports.getSpendingAnalytics = async (req, res) => {
    try {
          const { period = 'month', year, month } = req.query;
          const userId = req.user.id;

      const now = new Date();
          let startDate, endDate;

      if (period === 'month') {
              const y = year ? parseInt(year) : now.getFullYear();
              const m = month ? parseInt(month) - 1 : now.getMonth();
              startDate = new Date(y, m, 1);
              endDate = new Date(y, m + 1, 0, 23, 59, 59);
      } else if (period === 'year') {
              const y = year ? parseInt(year) : now.getFullYear();
              startDate = new Date(y, 0, 1);
              endDate = new Date(y, 11, 31, 23, 59, 59);
      } else if (period === 'week') {
              const dayOfWeek = now.getDay();
              startDate = new Date(now);
              startDate.setDate(now.getDate() - dayOfWeek);
              startDate.setHours(0, 0, 0, 0);
              endDate = new Date(startDate);
              endDate.setDate(startDate.getDate() + 6);
              endDate.setHours(23, 59, 59, 999);
      }

      const transactions = await Transaction.find({
              user: userId,
              date: { $gte: startDate, $lte: endDate },
              type: 'expense',
      });

      // Group spending by category
      const categoryMap = {};
          let totalSpent = 0;

      transactions.forEach((t) => {
              const cat = t.category || 'Uncategorized';
              if (!categoryMap[cat]) {
                        categoryMap[cat] = { total: 0, count: 0, transactions: [] };
              }
              categoryMap[cat].total += t.amount;
              categoryMap[cat].count += 1;
              categoryMap[cat].transactions.push({
                        id: t._id,
                        amount: t.amount,
                        description: t.description,
                        date: t.date,
              });
              totalSpent += t.amount;
      });

      const categories = Object.entries(categoryMap).map(([name, data]) => ({
              category: name,
              total: parseFloat(data.total.toFixed(2)),
              count: data.count,
              percentage: totalSpent > 0 ? parseFloat(((data.total / totalSpent) * 100).toFixed(1)) : 0,
      }));

      categories.sort((a, b) => b.total - a.total);

      res.status(200).json({
              success: true,
              data: {
                        period,
                        startDate,
                        endDate,
                        totalSpent: parseFloat(totalSpent.toFixed(2)),
                        transactionCount: transactions.length,
                        categories,
              },
      });
    } catch (error) {
          console.error('getSpendingAnalytics error:', error);
          res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get income vs expense analytics
// @route   GET /api/analytics/income-vs-expense
// @access  Private
exports.getIncomeVsExpense = async (req, res) => {
    try {
          const { months = 6 } = req.query;
          const userId = req.user.id;
          const numMonths = Math.min(parseInt(months), 24);

      const results = [];
          const now = new Date();

      for (let i = numMonths - 1; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const startDate = new Date(d.getFullYear(), d.getMonth(), 1);
              const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

            const [income, expenses] = await Promise.all([
                      Transaction.aggregate([
                        { $match: { user: userId, type: 'income', date: { $gte: startDate, $lte: endDate } } },
                        { $group: { _id: null, total: { $sum: '$amount' } } },
                                ]),
                      Transaction.aggregate([
                        { $match: { user: userId, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
                        { $group: { _id: null, total: { $sum: '$amount' } } },
                                ]),
                    ]);

            const totalIncome = income[0]?.total || 0;
              const totalExpenses = expenses[0]?.total || 0;

            results.push({
                      month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
                      income: parseFloat(totalIncome.toFixed(2)),
                      expenses: parseFloat(totalExpenses.toFixed(2)),
                      netSavings: parseFloat((totalIncome - totalExpenses).toFixed(2)),
                      savingsRate:
                                  totalIncome > 0
                          ? parseFloat((((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1))
                                    : 0,
            });
      }

      res.status(200).json({ success: true, data: results });
    } catch (error) {
          console.error('getIncomeVsExpense error:', error);
          res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get net worth snapshot
// @route   GET /api/analytics/net-worth
// @access  Private
exports.getNetWorth = async (req, res) => {
    try {
          const userId = req.user.id;

      const [incomeAgg, expenseAgg, goals] = await Promise.all([
              Transaction.aggregate([
                { $match: { user: userId, type: 'income' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
                      ]),
              Transaction.aggregate([
                { $match: { user: userId, type: 'expense' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
                      ]),
              Goal.find({ user: userId }),
            ]);

      const totalIncome = incomeAgg[0]?.total || 0;
          const totalExpenses = expenseAgg[0]?.total || 0;
          const netSavings = totalIncome - totalExpenses;

      const totalSavedForGoals = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);

      res.status(200).json({
              success: true,
              data: {
                        totalIncome: parseFloat(totalIncome.toFixed(2)),
                        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
                        netSavings: parseFloat(netSavings.toFixed(2)),
                        totalSavedForGoals: parseFloat(totalSavedForGoals.toFixed(2)),
                        estimatedNetWorth: parseFloat((netSavings + totalSavedForGoals).toFixed(2)),
              },
      });
    } catch (error) {
          console.error('getNetWorth error:', error);
          res.status(500).json({ success: false, message: 'Server error' });
    }
};
