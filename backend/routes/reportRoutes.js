const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getSpendingByCategory,
    getMonthlyTrend,
  } = require('../controllers/reportController');

// @route   GET /api/reports/spending-by-category
// @desc    Get spending totals grouped by category for a given month/year
// @access  Private
router.get('/spending-by-category', protect, getSpendingByCategory);

// @route   GET /api/reports/monthly-trend
// @desc    Get income vs expenses trend for the last 6 months
// @access  Private
router.get('/monthly-trend', protect, getMonthlyTrend);

module.exports = router;
