const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticateToken } = require('./auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Order Schema (same as in orders.js)
const orderSchema = new mongoose.Schema({
  shoptet_order_id: String,
  customer_email: { type: String, required: true },
  product_id: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  payment_id: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  processed_at: Date
});

const Order = mongoose.model('Order', orderSchema);

// GET /api/subscriptions - Get all subscriptions (orders as subscriptions)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    const subscriptions = orders.map(order => ({
      id: order._id,
      customer_email: order.customer_email,
      plan: order.product_id || 'Premium Plan',
      amount: order.amount,
      currency: order.currency,
      status: order.status === 'completed' ? 'active' : order.status,
      created_at: order.created_at,
      payment_id: order.payment_id,
      shoptet_order_id: order.shoptet_order_id
    }));
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
    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0);
    
    res.json({ active, canceled, totalRevenue });
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

module.exports = router;