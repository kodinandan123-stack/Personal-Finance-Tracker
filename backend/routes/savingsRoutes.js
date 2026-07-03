const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSavingsRate, getSavingsProjection } = require('../controllers/savingsController');

/**
 * @route   GET /api/savings/rate
 * @desc    Get monthly savings rate breakdown for the past N months
 * @query   months (default: 6)
 * @access  Private
 */
router.get('/rate', protect, getSavingsRate);

/**
 * @route   GET /api/savings/projection
 * @desc    Project how many months until a savings target is reached
 * @query   targetAmount (required), months (default: 6)
 * @access  Private
 */
router.get('/projection', protect, getSavingsProjection);

module.exports = router;
