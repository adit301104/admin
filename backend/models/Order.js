const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  shoptet_order_id: String,
  customer_email: { type: String, required: true },
  product_id: String,
  product_name: String,
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  interval: String,
  source: String,
  payment_id: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  processed_at: Date
});

module.exports = mongoose.model('Order', orderSchema);