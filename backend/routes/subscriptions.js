const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticateToken } = require('./auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/subscriptions - Get all subscriptions (orders as subscriptions)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    console.log('Found orders:', orders.length);
    
    const subscriptions = orders.map(order => ({
      id: order._id,
      customer_email: order.customer_email,
      plan: order.product_name || order.product_id || 'Premium Plan',
      amount: order.amount,
      currency: order.currency,
      interval: order.interval,
      status: order.status === 'completed' ? 'active' : order.status,
      created_at: order.created_at,
      payment_id: order.payment_id,
      shoptet_order_id: order.shoptet_order_id,
      source: order.source
    }));
    
    console.log('Returning subscriptions:', subscriptions.length);
    res.json({ subscriptions });
  } catch (error) {
    console.error('Subscriptions fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/subscriptions/stats - Get subscription statistics
router.get('/stats', async (req, res) => {
  try {
    const orders = await Order.find();
    const active = orders.filter(o => o.status === 'completed').length;
    const canceled = orders.filter(o => o.status === 'failed').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    
    res.json({ 
      active, 
      canceled, 
      pending,
      total: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/subscriptions/:id - Delete a subscription/order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.json({ success: true, message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to check raw data
router.get('/test', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json({ 
      message: 'Raw data from database',
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;