const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getSpendingAnalytics,
    getIncomeVsExpense,
    getNetWorthOverTime,
} = require('../controllers/analyticsController');

// All analytics routes are protected
router.use(protect);

// @route GET /api/analytics/spending
// @desc  Spending breakdown by category for a given period
router.get('/spending', getSpendingAnalytics);

// @route GET /api/analytics/income-vs-expense
// @desc  Monthly income vs expense comparison
router.get('/income-vs-expense', getIncomeVsExpense);

// @route GET /api/analytics/net-worth
// @desc  Net worth over time
router.get('/net-worth', getNetWorthOverTime);

module.exports = router;
