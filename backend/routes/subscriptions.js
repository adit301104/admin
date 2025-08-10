const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/subscriptions - Get all subscriptions
router.get('/', async (req, res) => {
  try {
    res.json({ subscriptions: [] });
  } catch (error) {
    console.error('Subscriptions fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/subscriptions/stats - Get subscription statistics
router.get('/stats', async (req, res) => {
  try {
    res.json({
      active: 0,
      canceled: 0,
      totalRevenue: 0
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;