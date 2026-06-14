const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboardSummary } = require('../controllers/dashboardController');

// @route   GET /api/dashboard
// @desc    Get dashboard summary: monthly totals, recent transactions, budget status, goals
// @access  Private
router.get('/', protect, getDashboardSummary);

module.exports = router;
