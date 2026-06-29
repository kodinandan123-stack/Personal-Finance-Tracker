const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRecurringTransactions,
  getRecurringTransactionById,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  processDueTransactions,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
} = require('../controllers/recurringTransactionController');

// All routes require authentication
router.use(protect);

// GET /api/recurring-transactions - Get all recurring transactions for user
router.get('/', getRecurringTransactions);

// POST /api/recurring-transactions - Create a new recurring transaction
router.post('/', createRecurringTransaction);

// POST /api/recurring-transactions/process-due - Process all due recurring transactions
router.post('/process-due', processDueTransactions);

// GET /api/recurring-transactions/:id - Get a single recurring transaction
router.get('/:id', getRecurringTransactionById);

// PUT /api/recurring-transactions/:id - Update a recurring transaction
router.put('/:id', updateRecurringTransaction);

// DELETE /api/recurring-transactions/:id - Delete a recurring transaction
router.delete('/:id', deleteRecurringTransaction);

// PATCH /api/recurring-transactions/:id/pause - Pause a recurring transaction
router.patch('/:id/pause', pauseRecurringTransaction);

// PATCH /api/recurring-transactions/:id/resume - Resume a paused recurring transaction
router.patch('/:id/resume', resumeRecurringTransaction);

module.exports = router;
