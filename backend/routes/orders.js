const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/orders - Process order from form
router.post('/', async (req, res) => {
  try {
    const { customer_email, product_id, product_name, amount, currency, interval, shoptet_order_id, source } = req.body;
    
    console.log('Received order data:', req.body);
    
    if (!customer_email || !amount) {
      return res.status(400).json({ error: 'Missing required fields: customer_email, amount' });
    }

    // Create order record
    const order = new Order({
      shoptet_order_id,
      customer_email,
      product_id,
      product_name,
      amount,
      currency: currency || 'EUR',
      interval,
      source,
      status: 'pending'
    });

    await order.save();
    console.log('Order saved:', order._id);

    // Generate payment ID and mark as completed
    order.payment_id = 'PAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    order.status = 'completed';
    order.processed_at = new Date();
    await order.save();
    
    console.log('Order completed:', order._id);

    res.json({
      success: true,
      order_id: order._id,
      payment_id: order.payment_id,
      status: 'completed',
      message: 'Order processed successfully'
    });
  } catch (error) {
    console.error('Order processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 }).limit(100);
    res.json({ orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;