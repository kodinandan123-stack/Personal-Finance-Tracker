const express = require('express');
const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint for uptime monitoring and load balancers
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
  status: 'ok',
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
  });
});

module.exports = router;
