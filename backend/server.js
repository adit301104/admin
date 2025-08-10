require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const mongoose = require('mongoose');
const connectDB = require('./database/mongodb');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const { router: authRouter } = require('./routes/auth');
const ordersRouter = require('./routes/orders');
const subscriptionsRouter = require('./routes/subscriptions');
const webhooksRouter = require('./routes/webhooks');

// Routes
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/webhooks', webhooksRouter);

// Cron job for recurring billing
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily billing check...');
  // Add billing logic here
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app };