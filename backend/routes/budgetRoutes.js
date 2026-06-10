const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/budgets/summary
 * @desc    Get budget summary for a given month (income, expenses, per-category)
 * @access  Private
 * @query   month (optional) - YYYY-MM format, defaults to current month
 */
router.get('/summary', getBudgetSummary);

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets for the authenticated user
 * @access  Private
 * @query   month (optional) - filter budgets by YYYY-MM
 */
router.get('/', getBudgets);

/**
 * @route   POST /api/budgets
 * @desc    Create a new budget entry
 * @access  Private
 * @body    { category, limit, month }
 */
router.post('/', createBudget);

/**
 * @route   PUT /api/budgets/:id
 * @desc    Update an existing budget
 * @access  Private
 * @body    { category?, limit?, month? }
 */
router.put('/:id', updateBudget);

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete a budget entry
 * @access  Private
 */
router.delete('/:id', deleteBudget);

module.exports = router;
