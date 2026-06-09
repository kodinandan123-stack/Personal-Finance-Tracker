const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  exportTransactionsCSV,
} = require('../controllers/transactionController');

// All routes are protected
router.get('/summary', protect, getSummary);
router.get('/export', protect, exportTransactionsCSV);
router.get('/', protect, getTransactions);
router.post('/', protect, addTransaction);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
