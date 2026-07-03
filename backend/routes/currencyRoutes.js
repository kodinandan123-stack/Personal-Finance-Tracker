const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getSupportedCurrencies,
    convertCurrency,
    getExchangeRates,
} = require('../controllers/currencyController');

/**
 * @route   GET /api/currency/supported
 * @desc    Get list of all supported currencies
 * @access  Private
 */
router.get('/supported', protect, getSupportedCurrencies);

/**
 * @route   GET /api/currency/convert
 * @desc    Convert an amount between two currencies
 * @query   from, to, amount
 * @access  Private
 */
router.get('/convert', protect, convertCurrency);

/**
 * @route   GET /api/currency/rates
 * @desc    Get all exchange rates for a base currency
 * @query   base (default: USD)
 * @access  Private
 */
router.get('/rates', protect, getExchangeRates);

module.exports = router;
