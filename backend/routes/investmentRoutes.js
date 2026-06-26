const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getInvestments,
    createInvestment,
      updateInvestment,
        deleteInvestment,
          getPortfolioSummary,
          } = require('../controllers/investmentController');

          // Portfolio summary (must come before /:id to avoid route conflict)
          router.get('/summary', protect, getPortfolioSummary);

          // CRUD routes
          router.get('/', protect, getInvestments);
          router.post('/', protect, createInvestment);
          router.put('/:id', protect, updateInvestment);
          router.delete('/:id', protect, deleteInvestment);

          module.exports = router;
