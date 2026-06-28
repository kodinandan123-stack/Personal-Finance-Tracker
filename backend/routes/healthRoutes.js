const express = require('express');
const router = express.Router();
const { getHealth } = require('../controllers/healthController');

// @route GET /api/health
// @desc  Health check endpoint for uptime monitoring and load balancers
// @access Public
router.get('/', getHealth);

module.exports = router;
