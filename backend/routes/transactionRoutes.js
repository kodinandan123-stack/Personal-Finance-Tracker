const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
} = require('../controllers/transactionController');

// All routes are protected
router.get('/', protect, getTransactions);
router.post('/', protect, addTransaction);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
